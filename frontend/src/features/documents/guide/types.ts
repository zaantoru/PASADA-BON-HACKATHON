import type { DocType, EntryType } from '@/types/index'
import type { SourceRef } from '@/features/documents/guide/sources'

export type Lang = 'en' | 'fil'
export type SectionKey = 'card' | 'category' | 'followUp' | 'watch' | 'costs'

/** Only reviewed (user-confirmed) values. Raw OCR text is never passed to the guide. */
export interface GuideInput {
  documentId: string
  documentType: DocType
  facilityName: string | null
  documentDate: string | null
  category: string | null
  animal: string | null
  bodyArea: string | null
  place: string | null
  exposureDate: string | null
  entries: { rowLabel: string | null; date: string | null; description: string | null; entryType: EntryType; savedAs: 'visit' | 'follow_up' | 'document_only' }[]
  confirmedAppointments: { date: string; rowLabel: string | null; facilityName: string | null }[]
  hasPayment: boolean
}

export type BlockKind = 'from_card' | 'general' | 'needs_confirmation'

export interface GuideBlock {
  kind: BlockKind
  heading?: string
  text?: string
  items?: { label: string; detail?: string; tag?: string }[]
  more?: string[]
  source?: SourceRef
}

export interface GuideSection {
  title: string
  summary: string
  blocks: GuideBlock[]
}

/** Allowlisted, app-defined actions. The guide can only reference these. */
export type GuideAction =
  | { type: 'show_public_centers'; section: SectionKey; placeId?: string; placeName?: string }
  | { type: 'view_assistance'; section: SectionKey }
  | { type: 'open_facility'; section: SectionKey; facilityId: string; facilityName: string }
  | { type: 'call_facility'; section: SectionKey; facilityId: string; phone: string; facilityName: string }
  | { type: 'set_reminder'; section: SectionKey }
  | { type: 'open_document_details'; section: SectionKey; panelSection: 'visits' | 'people' }

export interface GuideContent {
  lang: Lang
  inputHash: string
  generatedAt: string
  isDemo: true
  greeting: string
  overview: string
  sections: Record<SectionKey, GuideSection>
  tour: { target: SectionKey; title: string; body: string }[]
  actions: GuideAction[]
}
