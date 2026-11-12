export type AnimalType = 'dog' | 'cat' | 'other' | 'unknown'
export type DocType = 'treatment_card' | 'instruction_sheet' | 'receipt'
export type EntryType = 'recorded_visit' | 'scheduled_follow_up' | 'observation' | 'unclear'
export type FieldStatus = 'read' | 'needs_checking' | 'not_recorded'

/** Amounts stay as written strings. A blank amount is null — never 0. */
export interface Payment {
  amount: string | null
  receiptNumber: string | null
  date: string | null
}

export interface Incident {
  id: string
  /** Date of incident/exposure (YYYY-MM-DD). */
  exposureDate: string | null
  /** Where the event happened. Never derived from patient or hospital addresses. */
  location: string | null
  animalType: AnimalType
  animalOther: string | null
  /** Where on the body the exposure occurred. */
  bodyAreas: string[]
  bodyAreaDetail: string | null
  notes: string | null
  source: 'manual' | 'document'
  /** Set when the incident was created from a reviewed document; edits to that document update it. */
  originDocumentId?: string | null
  createdAt: string
  updatedAt: string
}
export type IncidentInput = Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>

export interface Visit {
  id: string
  incidentId: string
  date: string
  facilityName: string | null
  notes: string | null
  rowLabel: string | null
  treatmentAsRecorded: string | null
  payment: Payment | null
  documentIds: string[]
  source: 'manual' | 'document'
  createdAt: string
  updatedAt: string
}
export interface VisitInput {
  date: string
  facilityName: string | null
  notes: string | null
  payment: Payment | null
}

/** A clinic-written appointment the user explicitly confirmed. */
export interface FollowUp {
  id: string
  incidentId: string
  date: string
  facilityName: string | null
  rowLabel: string | null
  note: string | null
  documentId: string
  confirmedAt: string
}

export interface RecordedValue {
  value: string | null
  raw: string | null
}

export interface ReviewedEntry {
  rowLabel: RecordedValue
  dateWritten: RecordedValue
  description: RecordedValue
  entryType: EntryType
  savedAs: 'visit' | 'follow_up' | 'document_only'
}

export interface ReviewedDocument {
  patient: Record<'name' | 'birthday' | 'idNumber' | 'address', RecordedValue>
  incident: Record<'exposureDate' | 'animalType' | 'bodyArea' | 'place' | 'category', RecordedValue>
  facility: Record<'name' | 'documentDate' | 'formRevision', RecordedValue>
  entries: ReviewedEntry[]
  payment: Record<'amount' | 'receiptNumber' | 'paymentDate', RecordedValue> | null
}

export interface StoredDocument {
  id: string
  incidentId: string
  visitIds: string[]
  type: DocType
  fileName: string
  mimeType: string
  previewUrl: string | null
  reviewed: ReviewedDocument
  isDemoExtraction: boolean
  savedAt: string
}

export interface ExtractedField {
  value: string | null
  /** Wording as it appears on the document. */
  raw: string | null
  status: FieldStatus
  note?: string
}

export interface ExtractedEntry {
  id: string
  rowLabel: ExtractedField
  dateWritten: ExtractedField
  description: ExtractedField
  entryType: EntryType
  entryTypeStatus: FieldStatus
  entryTypeNote?: string
}

export interface ExtractionResult {
  outcome: 'ready' | 'partial'
  documentType: DocType
  patient: Record<'name' | 'birthday' | 'idNumber' | 'address', ExtractedField>
  incident: Record<'exposureDate' | 'animalType' | 'bodyArea' | 'place' | 'category', ExtractedField>
  facility: Record<'name' | 'documentDate' | 'formRevision', ExtractedField>
  entries: ExtractedEntry[]
  payment: Record<'amount' | 'receiptNumber' | 'paymentDate', ExtractedField> | null
  isDemo: true
}

export interface FacilityReview {
  id: string
  rating: number
  text: string
  author: string
  date: string
}

/** Details copied from an official published source. Only these may support cost or hours claims. */
export interface SourcedInfo {
  hours: string | null
  cost: string | null
  costNote: string | null
  sourceName: string
  sourceUrl: string
  lastChecked: string
}

export interface Facility {
  id: string
  name: string
  ownership: 'public' | 'private'
  address: string
  area: string
  city: string
  lat: number
  lng: number
  /** True when the map position is approximate (source lists no address). */
  approximateLocation?: boolean
  phone: string | null
  services: string[]
  reviews: FacilityReview[]
  sourced?: SourcedInfo
  /** Demo directory entries are fictional. */
  demo: boolean
}

export interface AssistanceOffice {
  id: string
  name: string
  kind: 'malasakit' | 'medical_social_service'
  hostName: string
  hostFacilityId: string | null
  city: string
  lat: number
  lng: number
  approximateLocation?: boolean
  address: string | null
  phone: string | null
  hours: string | null
  /** Assistance as described by the official source. */
  description: string | null
  whoMayAvail: string | null
  requirements: { group: string; items: string[] }[] | null
  sourceName: string | null
  sourceUrl: string | null
  lastChecked: string | null
  demo: boolean
}

export type ReportPeriod = '30d' | '90d' | '12m'
export type HotspotAnimal = 'all' | 'dog' | 'cat'

export interface HotspotArea {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  reports: Record<ReportPeriod, { dog: number; cat: number }>
  updated: string
}

export interface PlaceOption {
  id: string
  name: string
  lat: number
  lng: number
}
