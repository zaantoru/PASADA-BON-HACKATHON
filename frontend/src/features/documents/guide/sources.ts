import { DOH_CHARTER_CHECKED, DOH_CHARTER_NAME, DOH_CHARTER_URL } from '@/mocks/facilities'

export interface SourceRef {
  id: 'who-rabies' | 'doh-charter'
  name: string
  url: string
  checked: string
}

export const SOURCES: Record<SourceRef['id'], SourceRef> = {
  'who-rabies': {
    id: 'who-rabies',
    name: 'World Health Organization — Rabies fact sheet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/rabies',
    checked: '2026-11-12',
  },
  'doh-charter': { id: 'doh-charter', name: DOH_CHARTER_NAME, url: DOH_CHARTER_URL, checked: DOH_CHARTER_CHECKED },
}

/** Review status for general education. Shown to users so nothing is presented as clinician-approved. */
export const CONTENT_STATUS = {
  en: 'Summarized from the sources below by the PASADA team for this prototype. Clinician review is still pending.',
  fil: 'Ibinuod ng PASADA team mula sa mga source sa ibaba para sa prototype na ito. Hinihintay pa ang pagsusuri ng clinician.',
}
