import { blankToNull } from '@/utils/format'
import type {
  AnimalType,
  DocType,
  EntryType,
  ExtractedField,
  ExtractionResult,
  FieldStatus,
  Incident,
  Payment,
  RecordedValue,
  ReviewedDocument,
  StoredDocument,
} from '@/types/index'
import { useCallback, useState } from 'react'

/* ---------- Review state ---------- */

export interface RF {
  value: string
  raw: string | null
  status: FieldStatus
  note?: string
  resolved: boolean
}
export const toRF = (f: ExtractedField): RF => ({
  value: f.value ?? '',
  raw: f.raw,
  status: f.status,
  note: f.note,
  resolved: f.status !== 'needs_checking',
})

export interface REntry {
  id: string
  rowLabel: RF
  dateWritten: RF
  description: RF
  entryType: EntryType
  typeStatus: FieldStatus
  typeNote?: string
  typeResolved: boolean
  addToTracker: boolean
  expanded: boolean
}

export type PatientKey = 'name' | 'birthday' | 'idNumber' | 'address'
export type IncidentKey = 'exposureDate' | 'animalType' | 'bodyArea' | 'place' | 'category'
export type FacilityKey = 'name' | 'documentDate' | 'formRevision'
export type PaymentKey = 'amount' | 'receiptNumber' | 'paymentDate'

export interface RState {
  documentType: DocType
  patient: Record<PatientKey, RF>
  incident: Record<IncidentKey, RF>
  facility: Record<FacilityKey, RF>
  entries: REntry[]
  payment: Record<PaymentKey, RF> | null
}

function mapRecord<K extends string>(r: Record<K, ExtractedField>): Record<K, RF> {
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, toRF(v as ExtractedField)])) as Record<K, RF>
}

export function initState(r: ExtractionResult): RState {
  return {
    documentType: r.documentType,
    patient: mapRecord(r.patient),
    incident: mapRecord(r.incident),
    facility: mapRecord(r.facility),
    payment: r.payment ? mapRecord(r.payment) : null,
    entries: r.entries.map((e) => {
      const isBlank = !e.dateWritten.value && !e.description.value && e.dateWritten.status === 'not_recorded'
      return {
        id: e.id,
        rowLabel: toRF(e.rowLabel),
        dateWritten: toRF(e.dateWritten),
        description: toRF(e.description),
        entryType: e.entryType,
        typeStatus: e.entryTypeStatus,
        typeNote: e.entryTypeNote,
        typeResolved: e.entryTypeStatus !== 'needs_checking',
        // Only clearly recorded rows default into the tracker. Appointments always need explicit confirmation.
        addToTracker: e.entryType === 'recorded_visit' && e.entryTypeStatus === 'read' && !!e.dateWritten.value,
        expanded: !isBlank,
      }
    }),
  }
}

export const needs = (f: RF) => f.status === 'needs_checking' && !f.resolved

const fieldLabels: Record<string, string> = {
  'patient.name': 'Patient name',
  'patient.birthday': 'Birthday',
  'patient.idNumber': 'Card or registration number',
  'patient.address': 'Patient address',
  'incident.exposureDate': 'Exposure date',
  'incident.animalType': 'Animal type',
  'incident.bodyArea': 'Affected body area',
  'incident.place': 'Place of exposure',
  'incident.category': 'Exposure category',
  'facility.name': 'Facility name',
  'facility.documentDate': 'Document date',
  'facility.formRevision': 'Form revision',
  'payment.amount': 'Amount paid',
  'payment.receiptNumber': 'Receipt number',
  'payment.paymentDate': 'Payment date',
}

export function outstanding(s: RState) {
  const list: { id: string; label: string }[] = []
  const scan = (section: 'patient' | 'incident' | 'facility' | 'payment', rec: Record<string, RF> | null) => {
    if (!rec) return
    for (const [k, f] of Object.entries(rec)) if (needs(f)) list.push({ id: `rv-${section}-${k}`, label: fieldLabels[`${section}.${k}`] })
  }
  scan('patient', s.patient)
  scan('incident', s.incident)
  scan('facility', s.facility)
  s.entries.forEach((e) => {
    const name = e.rowLabel.value || 'Visit entry'
    if (needs(e.dateWritten)) list.push({ id: `rv-entry-${e.id}-dateWritten`, label: `${name}: date written` })
    if (needs(e.description)) list.push({ id: `rv-entry-${e.id}-description`, label: `${name}: treatment or notes` })
    if (e.typeStatus === 'needs_checking' && !e.typeResolved) list.push({ id: `rv-entry-${e.id}-type`, label: `${name}: entry type` })
  })
  scan('payment', s.payment)
  return list
}

export function focusField(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const focusable = el.matches('input,select,textarea,[tabindex]') ? el : el.querySelector<HTMLElement>('input,select,textarea,button')
  ;(focusable as HTMLElement | null)?.focus({ preventScroll: true })
}


/** Builds review state from an already-confirmed document so it can be edited later. */
export function stateFromStored(doc: StoredDocument): RState {
  const rf = (rv: RecordedValue): RF => ({ value: rv.value ?? '', raw: rv.raw, status: 'read', resolved: true })
  const rec = <K extends string>(r: Record<K, RecordedValue>) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, rf(v as RecordedValue)])) as Record<K, RF>
  return {
    documentType: doc.type,
    patient: rec(doc.reviewed.patient),
    incident: rec(doc.reviewed.incident),
    facility: rec(doc.reviewed.facility),
    payment: doc.reviewed.payment ? rec(doc.reviewed.payment) : null,
    entries: doc.reviewed.entries.map((e, i) => ({
      id: `saved-${i}`,
      rowLabel: rf(e.rowLabel),
      dateWritten: rf(e.dateWritten),
      description: rf(e.description),
      entryType: e.entryType,
      typeStatus: 'read' as FieldStatus,
      typeResolved: true,
      addToTracker: e.savedAs !== 'document_only',
      expanded: !!(e.dateWritten.value || e.description.value),
    })),
  }
}

/** Fields whose uncertainty should open the review panel automatically. */
export function criticalOutstanding(s: RState) {
  return outstanding(s).filter((t) => /^rv-(incident|entry|payment-amount)/.test(t.id))
}

export const val = (f: RF) => blankToNull(f.value)

export function trackerEntries(s: RState) {
  return {
    visits: s.entries.filter((e) => e.entryType === 'recorded_visit' && e.addToTracker),
    followUps: s.entries.filter((e) => e.entryType === 'scheduled_follow_up' && e.addToTracker),
  }
}

export function incidentFromReview(s: RState): Pick<Incident, 'exposureDate' | 'location' | 'animalType' | 'animalOther' | 'bodyAreas' | 'bodyAreaDetail'> {
  return {
    exposureDate: val(s.incident.exposureDate),
    // Patient and facility addresses are never used here.
    location: val(s.incident.place),
    animalType: (val(s.incident.animalType) as AnimalType | null) ?? 'unknown',
    animalOther: null,
    bodyAreas: [],
    bodyAreaDetail: val(s.incident.bodyArea),
  }
}

/** Validation shared by first confirmation and later edits. */
export function reviewErrors(s: RState) {
  const todo = outstanding(s)
  const { visits, followUps } = trackerEntries(s)
  const errors: { id: string; message: string }[] = []
  if (todo.length) errors.push({ id: todo[0].id, message: `${todo.length} detail${todo.length > 1 ? 's' : ''} still need checking.` })
  ;[...visits, ...followUps]
    .filter((e) => !val(e.dateWritten))
    .forEach((e) => errors.push({ id: `rv-entry-${e.id}-dateWritten`, message: `${e.rowLabel.value || 'An entry'} needs a date to appear in the tracker.` }))
  return errors
}

/** Converts the corrected review into what gets saved. Guidance is generated only from this output. */
export function buildReviewOutput(s: RState) {
  const rec = (f: RF): RecordedValue => ({ value: val(f), raw: f.raw })
  const { visits, followUps } = trackerEntries(s)
  const reviewed: ReviewedDocument = {
    patient: { name: rec(s.patient.name), birthday: rec(s.patient.birthday), idNumber: rec(s.patient.idNumber), address: rec(s.patient.address) },
    incident: {
      exposureDate: rec(s.incident.exposureDate),
      animalType: rec(s.incident.animalType),
      bodyArea: rec(s.incident.bodyArea),
      place: rec(s.incident.place),
      category: rec(s.incident.category),
    },
    facility: { name: rec(s.facility.name), documentDate: rec(s.facility.documentDate), formRevision: rec(s.facility.formRevision) },
    entries: s.entries.map((e) => ({
      rowLabel: rec(e.rowLabel),
      dateWritten: rec(e.dateWritten),
      description: rec(e.description),
      entryType: e.entryType,
      savedAs:
        e.addToTracker && e.entryType === 'recorded_visit' ? 'visit' : e.addToTracker && e.entryType === 'scheduled_follow_up' ? 'follow_up' : 'document_only',
    })),
    payment: s.payment ? { amount: rec(s.payment.amount), receiptNumber: rec(s.payment.receiptNumber), paymentDate: rec(s.payment.paymentDate) } : null,
  }
  const paymentPresent = !!s.payment && Object.values(s.payment).some((f) => val(f))
  const payment: Payment | null = paymentPresent
    ? { amount: val(s.payment!.amount), receiptNumber: val(s.payment!.receiptNumber), date: val(s.payment!.paymentDate) }
    : null
  const facilityName = val(s.facility.name)
  return {
    documentType: s.documentType,
    reviewed,
    visitEntries: visits.map((e) => ({ date: val(e.dateWritten)!, rowLabel: val(e.rowLabel), description: val(e.description), facilityName })),
    followUps: followUps.map((e) => ({ date: val(e.dateWritten)!, rowLabel: val(e.rowLabel), note: val(e.description), facilityName })),
    payment,
  }
}

const emptyRF = (): RF => toRF({ value: null, raw: null, status: 'not_recorded' })

/** State + typed setters for the review form. */
export function useReviewState(init: () => RState) {
  const [s, setS] = useState<RState>(init)
  const setField = useCallback(
    <S extends 'patient' | 'incident' | 'facility'>(section: S, key: keyof RState[S], patch: Partial<RF>) =>
      setS((st) => ({ ...st, [section]: { ...st[section], [key]: { ...(st[section] as Record<string, RF>)[key as string], ...patch } } })),
    [],
  )
  const setPayment = useCallback(
    (key: PaymentKey, patch: Partial<RF>) =>
      setS((st) => (st.payment ? { ...st, payment: { ...st.payment, [key]: { ...st.payment[key], ...patch } } } : st)),
    [],
  )
  const addPayment = useCallback(
    () => setS((st) => ({ ...st, payment: { amount: emptyRF(), receiptNumber: emptyRF(), paymentDate: emptyRF() } })),
    [],
  )
  const setEntry = useCallback(
    (id: string, patch: Partial<REntry>) => setS((st) => ({ ...st, entries: st.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    [],
  )
  const setEntryField = useCallback(
    (id: string, key: 'rowLabel' | 'dateWritten' | 'description', patch: Partial<RF>) =>
      setS((st) => ({ ...st, entries: st.entries.map((e) => (e.id === id ? { ...e, [key]: { ...e[key], ...patch } } : e)) })),
    [],
  )
  const setDocType = useCallback((t: DocType) => setS((st) => ({ ...st, documentType: t })), [])
  return { s, setS, setField, setPayment, addPayment, setEntry, setEntryField, setDocType }
}
export type ReviewApi = ReturnType<typeof useReviewState>
