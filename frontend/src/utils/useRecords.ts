import { useContext, useMemo } from 'react'
import { RecordsContext } from '@/context/records-context'

export function useRecords() {
  const ctx = useContext(RecordsContext)
  if (!ctx) throw new Error('useRecords must be used inside RecordsProvider')
  return ctx
}

/** Sorted helpers shared by several screens. */
export function useIncidentData(incidentId: string | undefined) {
  const r = useRecords()
  return useMemo(() => {
    const incident = r.incidents.find((i) => i.id === incidentId) ?? null
    const visits = r.visits.filter((v) => v.incidentId === incidentId).sort((a, b) => a.date.localeCompare(b.date))
    const documents = r.documents.filter((d) => d.incidentId === incidentId)
    const followUps = r.followUps
      .filter((f) => f.incidentId === incidentId)
      .sort((a, b) => a.date.localeCompare(b.date))
    return { incident, visits, documents, followUps }
  }, [r, incidentId])
}
