import { RecordsContext } from './records-context'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { IncidentInput, VisitInput } from '@/types/index'
import {
  recordsService,
  type RecordsSnapshot,
  type SaveReviewPayload,
} from '@/service/recordsService'

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<RecordsSnapshot>(() => recordsService.load())

  const createIncident = useCallback(async (input: IncidentInput) => {
    const { snapshot, result } = await recordsService.createIncident(input)
    setSnapshot(snapshot)
    return result.id
  }, [])
  const updateIncident = useCallback(async (id: string, input: IncidentInput) => {
    const { snapshot } = await recordsService.updateIncident(id, input)
    setSnapshot(snapshot)
  }, [])
  const createVisit = useCallback(async (incidentId: string, input: VisitInput) => {
    const { snapshot, result } = await recordsService.createVisit(incidentId, input)
    setSnapshot(snapshot)
    return result.id
  }, [])
  const updateVisit = useCallback(async (id: string, input: VisitInput) => {
    const { snapshot } = await recordsService.updateVisit(id, input)
    setSnapshot(snapshot)
  }, [])
  const saveReviewedDocument = useCallback(async (p: SaveReviewPayload) => {
    const { snapshot, result } = await recordsService.saveReviewedDocument(p)
    setSnapshot(snapshot)
    return result
  }, [])
  const updateReviewedDocument = useCallback(async (documentId: string, p: Omit<SaveReviewPayload, 'target'>) => {
    const { snapshot, result } = await recordsService.updateReviewedDocument(documentId, p)
    setSnapshot(snapshot)
    return result
  }, [])
  const reset = useCallback(async () => {
    setSnapshot(await recordsService.reset())
  }, [])

  const value = useMemo(
    () => ({ ...snapshot, createIncident, updateIncident, createVisit, updateVisit, saveReviewedDocument, updateReviewedDocument, reset }),
    [snapshot, createIncident, updateIncident, createVisit, updateVisit, saveReviewedDocument, updateReviewedDocument, reset],
  )
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
}
