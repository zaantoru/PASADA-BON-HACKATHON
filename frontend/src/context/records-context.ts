import { createContext } from 'react'
import type { IncidentInput, VisitInput } from '@/types/index'
import type { RecordsSnapshot, SaveReviewPayload, SaveReviewResult } from '@/service/recordsService'

export interface RecordsApi extends RecordsSnapshot {
  createIncident: (input: IncidentInput) => Promise<string>
  updateIncident: (id: string, input: IncidentInput) => Promise<void>
  createVisit: (incidentId: string, input: VisitInput) => Promise<string>
  updateVisit: (id: string, input: VisitInput) => Promise<void>
  saveReviewedDocument: (p: SaveReviewPayload) => Promise<SaveReviewResult>
  updateReviewedDocument: (documentId: string, p: Omit<SaveReviewPayload, 'target'>) => Promise<SaveReviewResult>
  reset: () => Promise<void>
}

export const RecordsContext = createContext<RecordsApi | null>(null)
