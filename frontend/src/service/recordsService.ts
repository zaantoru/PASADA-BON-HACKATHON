import type {
  FollowUp,
  Incident,
  IncidentInput,
  Payment,
  ReviewedDocument,
  StoredDocument,
  Visit,
  VisitInput,
  DocType,
} from '@/types/index'
import { uid } from '@/utils/format'
import { wait } from '@/service/mockConfig'

export interface RecordsSnapshot {
  incidents: Incident[]
  visits: Visit[]
  documents: StoredDocument[]
  followUps: FollowUp[]
}

const KEY = 'pasada-ligtas:records:v1'
const empty = (): RecordsSnapshot => ({ incidents: [], visits: [], documents: [], followUps: [] })

function readStore(): RecordsSnapshot {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

function writeStore(s: RecordsSnapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // Storage full: retry without image previews so records still persist.
    localStorage.setItem(KEY, JSON.stringify({ ...s, documents: s.documents.map((d) => ({ ...d, previewUrl: null })) }))
  }
}

async function mutate<T>(fn: (s: RecordsSnapshot) => T): Promise<{ snapshot: RecordsSnapshot; result: T }> {
  await wait(450)
  const s = readStore()
  const result = fn(s)
  writeStore(s)
  return { snapshot: s, result }
}

const now = () => new Date().toISOString()

export interface SaveReviewPayload {
  target: { kind: 'existing'; incidentId: string } | { kind: 'new'; incident: IncidentInput }
  /** When scanning from a visit, the document attaches to it. */
  visitId: string | null
  document: {
    type: DocType
    fileName: string
    mimeType: string
    previewUrl: string | null
    reviewed: ReviewedDocument
  }
  visitEntries: { date: string; rowLabel: string | null; description: string | null; facilityName: string | null }[]
  followUps: { date: string; rowLabel: string | null; note: string | null; facilityName: string | null }[]
  payment: Payment | null
  /** Incident fields from the reviewed document; applied only to incidents created from it. */
  incidentFromDocument?: Pick<Incident, 'exposureDate' | 'location' | 'animalType' | 'bodyAreaDetail'>
}

export interface SaveReviewResult {
  incidentId: string
  documentId: string
  visitsAdded: number
  visitsLinked: number
  followUpsAdded: number
}

function linkEntries(
  s: RecordsSnapshot,
  incidentId: string,
  documentId: string,
  p: Pick<SaveReviewPayload, 'visitEntries' | 'followUps' | 'payment' | 'visitId'>,
) {
  const touched = new Set<string>()
  let visitsAdded = 0
  let visitsLinked = 0

  for (const entry of p.visitEntries) {
    // Merge with an existing visit on the same date instead of duplicating it.
    const existing = s.visits.find((v) => v.incidentId === incidentId && v.date === entry.date)
    if (existing) {
      if (!existing.documentIds.includes(documentId)) visitsLinked++
      existing.documentIds = Array.from(new Set([...existing.documentIds, documentId]))
      existing.rowLabel = existing.rowLabel ?? entry.rowLabel
      existing.treatmentAsRecorded = existing.treatmentAsRecorded ?? entry.description
      existing.facilityName = existing.facilityName ?? entry.facilityName
      existing.updatedAt = now()
      touched.add(existing.id)
    } else {
      const visit: Visit = {
        id: uid('vis'),
        incidentId,
        date: entry.date,
        facilityName: entry.facilityName,
        notes: null,
        rowLabel: entry.rowLabel,
        treatmentAsRecorded: entry.description,
        payment: null,
        documentIds: [documentId],
        source: 'document',
        createdAt: now(),
        updatedAt: now(),
      }
      s.visits.push(visit)
      touched.add(visit.id)
      visitsAdded++
    }
  }

  if (p.visitId) {
    const v = s.visits.find((x) => x.id === p.visitId && x.incidentId === incidentId)
    if (v) {
      v.documentIds = Array.from(new Set([...v.documentIds, documentId]))
      touched.add(v.id)
    }
  }

  if (p.payment) {
    const target =
      (p.visitId && s.visits.find((x) => x.id === p.visitId)) ||
      (p.payment.date && s.visits.find((x) => x.incidentId === incidentId && x.date === p.payment!.date)) ||
      null
    if (target && (!target.payment || target.documentIds.includes(documentId))) {
      target.payment = p.payment
      target.documentIds = Array.from(new Set([...target.documentIds, documentId]))
      touched.add(target.id)
    }
  }

  let followUpsAdded = 0
  for (const f of p.followUps) {
    if (s.followUps.some((x) => x.incidentId === incidentId && x.date === f.date)) continue
    s.followUps.push({ ...f, id: uid('fu'), incidentId, documentId, confirmedAt: now() })
    followUpsAdded++
  }
  return { visitIds: Array.from(touched), counts: { visitsAdded, visitsLinked, followUpsAdded } }
}

export const recordsService = {
  load: readStore,

  createIncident: (input: IncidentInput) =>
    mutate((s) => {
      const incident: Incident = { ...input, id: uid('inc'), createdAt: now(), updatedAt: now() }
      s.incidents.push(incident)
      return incident
    }),

  updateIncident: (id: string, input: IncidentInput) =>
    mutate((s) => {
      const i = s.incidents.findIndex((x) => x.id === id)
      if (i < 0) throw new Error('Incident not found')
      s.incidents[i] = { ...s.incidents[i], ...input, updatedAt: now() }
      return s.incidents[i]
    }),

  createVisit: (incidentId: string, input: VisitInput) =>
    mutate((s) => {
      if (!s.incidents.some((x) => x.id === incidentId)) throw new Error('Every visit must belong to an incident.')
      const visit: Visit = {
        ...input,
        id: uid('vis'),
        incidentId,
        rowLabel: null,
        treatmentAsRecorded: null,
        documentIds: [],
        source: 'manual',
        createdAt: now(),
        updatedAt: now(),
      }
      s.visits.push(visit)
      return visit
    }),

  updateVisit: (id: string, input: VisitInput) =>
    mutate((s) => {
      const i = s.visits.findIndex((x) => x.id === id)
      if (i < 0) throw new Error('Visit not found')
      s.visits[i] = { ...s.visits[i], ...input, updatedAt: now() }
      return s.visits[i]
    }),

  saveReviewedDocument: (p: SaveReviewPayload) =>
    mutate<SaveReviewResult>((s) => {
      const documentId = uid('doc')
      let incidentId: string
      if (p.target.kind === 'existing') {
        incidentId = p.target.incidentId
        if (!s.incidents.some((x) => x.id === incidentId)) throw new Error('The selected incident no longer exists.')
      } else {
        const incident: Incident = {
          ...p.target.incident,
          originDocumentId: documentId,
          id: uid('inc'),
          createdAt: now(),
          updatedAt: now(),
        }
        s.incidents.push(incident)
        incidentId = incident.id
      }

      const linked = linkEntries(s, incidentId, documentId, p)
      s.documents.push({
        ...p.document,
        id: documentId,
        incidentId,
        visitIds: linked.visitIds,
        isDemoExtraction: true,
        savedAt: now(),
      })
      return { incidentId, documentId, ...linked.counts }
    }),

  /**
   * Re-applies a corrected review to an already-saved document. Visits and follow-ups that came
   * only from this document are rebuilt from the revised entries; user-added visit data is kept.
   */
  updateReviewedDocument: (documentId: string, p: Omit<SaveReviewPayload, 'target'>) =>
    mutate<SaveReviewResult>((s) => {
      const doc = s.documents.find((d) => d.id === documentId)
      if (!doc) throw new Error('Document not found')
      const incidentId = doc.incidentId
      const newDates = new Set(p.visitEntries.map((e) => e.date))

      s.visits = s.visits.filter((v) => {
        if (!v.documentIds.includes(documentId) || newDates.has(v.date) || v.id === p.visitId) return true
        // Visits the user created keep their link to this document (e.g. a document scanned from a visit).
        if (v.source === 'manual') return true
        const onlyFromThisDoc = v.source === 'document' && v.documentIds.length === 1 && !v.notes && !v.payment
        if (onlyFromThisDoc) return false
        v.documentIds = v.documentIds.filter((id) => id !== documentId)
        return true
      })
      // Entries on this document own their row label and wording.
      for (const e of p.visitEntries) {
        const v = s.visits.find((x) => x.incidentId === incidentId && x.date === e.date && x.documentIds.includes(documentId))
        if (v) {
          v.rowLabel = e.rowLabel
          v.treatmentAsRecorded = e.description
          v.facilityName = v.facilityName ?? e.facilityName
        }
      }
      s.followUps = s.followUps.filter((f) => f.documentId !== documentId)

      const linked = linkEntries(s, incidentId, documentId, { ...p, visitId: p.visitId })
      doc.type = p.document.type
      doc.reviewed = p.document.reviewed
      doc.visitIds = s.visits.filter((v) => v.documentIds.includes(documentId)).map((v) => v.id)
      doc.savedAt = now()

      const incident = s.incidents.find((i) => i.id === incidentId)
      if (incident && incident.originDocumentId === documentId && p.incidentFromDocument) {
        Object.assign(incident, p.incidentFromDocument, { updatedAt: now() })
      }
      return { incidentId, documentId, ...linked.counts }
    }),

  reset: async () => {
    await wait(200)
    localStorage.removeItem(KEY)
    return empty()
  },
}
