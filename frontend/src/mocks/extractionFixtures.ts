import type { DocType, ExtractedEntry, ExtractedField, ExtractionResult } from '@/types/index'
import { demoDates, demoFacilityName, demoPatient, handwritten } from '@/mocks/demoDates'

const read = (value: string, raw: string | null = value): ExtractedField => ({ value, raw, status: 'read' })
const check = (value: string | null, raw: string | null, note: string): ExtractedField => ({
  value,
  raw,
  status: 'needs_checking',
  note,
})
const none = (): ExtractedField => ({ value: null, raw: null, status: 'not_recorded' })
const unreadable = (note = "Couldn't read this part of the document"): ExtractedField => ({
  value: null,
  raw: null,
  status: 'needs_checking',
  note,
})

function blankRow(id: string, label: string): ExtractedEntry {
  return {
    id,
    rowLabel: read(label),
    dateWritten: none(),
    description: none(),
    entryType: 'unclear',
    entryTypeStatus: 'not_recorded',
  }
}

function treatmentCard(): ExtractionResult {
  const d = demoDates()
  return {
    outcome: 'ready',
    documentType: 'treatment_card',
    isDemo: true,
    patient: {
      name: read(demoPatient.name),
      birthday: read(d.birthday, '08/21/94'),
      idNumber: read(demoPatient.idNumber),
      address: read(demoPatient.addressNormalized, demoPatient.address),
    },
    incident: {
      exposureDate: read(d.exposure, handwritten(d.exposure)),
      animalType: check(null, 'Check mark sits between “Dog” and “Cat”', 'The checkbox mark is unclear. Choose the box that is ticked.'),
      bodyArea: read('Left lower leg (calf)', 'L leg (calf)'),
      place: check('Brgy. Malanis, Quezon City', 'Brgy. Mal?nis, QC', 'Part of the handwriting is smudged.'),
      category: read('II', '☑ II'),
    },
    facility: {
      name: read(demoFacilityName),
      documentDate: read(d.d0, `Date issued: ${handwritten(d.d0)}`),
      formRevision: read('Form rev. 03-2021'),
    },
    entries: [
      {
        id: 'row-d0',
        rowLabel: read('D0'),
        dateWritten: read(d.d0, handwritten(d.d0)),
        description: read('PVRV 0.1mL ID x2 · initials RM'),
        entryType: 'recorded_visit',
        entryTypeStatus: 'read',
      },
      {
        id: 'row-d3',
        rowLabel: read('D3'),
        dateWritten: read(d.d3, handwritten(d.d3)),
        description: read('PVRV 0.1mL ID x2 · initials RM'),
        entryType: 'recorded_visit',
        entryTypeStatus: 'read',
      },
      {
        id: 'row-d7',
        rowLabel: read('D7'),
        dateWritten: read(d.d7, handwritten(d.d7)),
        description: none(),
        entryType: 'scheduled_follow_up',
        entryTypeStatus: 'needs_checking',
        entryTypeNote: 'A date is written but there is no dose or initials. It may be a return date.',
      },
      blankRow('row-d14', 'D14'),
      blankRow('row-d28', 'D28'),
    ],
    payment: null,
  }
}

function instructionSheet(): ExtractionResult {
  const d = demoDates()
  return {
    outcome: 'ready',
    documentType: 'instruction_sheet',
    isDemo: true,
    patient: { name: read(demoPatient.name), birthday: none(), idNumber: none(), address: none() },
    incident: {
      exposureDate: read(d.exposure, handwritten(d.exposure)),
      animalType: read('dog', 'Dog bite'),
      bodyArea: read('Left leg', 'L leg'),
      place: none(),
      category: none(),
    },
    facility: {
      name: read(demoFacilityName),
      documentDate: read(d.d0, `Date: ${handwritten(d.d0)}`),
      formRevision: read('IS-AB rev. 2022'),
    },
    entries: [
      {
        id: 'ins-return',
        rowLabel: read('Return on'),
        dateWritten: read(d.d3, handwritten(d.d3)),
        description: read('Bring this sheet and your treatment card.'),
        entryType: 'scheduled_follow_up',
        entryTypeStatus: 'read',
      },
      {
        id: 'ins-observe',
        rowLabel: read('Instruction 3'),
        dateWritten: none(),
        description: read('Observe the animal for 14 days and report changes.'),
        entryType: 'observation',
        entryTypeStatus: 'read',
      },
    ],
    payment: null,
  }
}

function receipt(): ExtractionResult {
  const d = demoDates()
  return {
    outcome: 'partial',
    documentType: 'receipt',
    isDemo: true,
    patient: { name: read(demoPatient.name), birthday: none(), idNumber: none(), address: none() },
    incident: { exposureDate: none(), animalType: none(), bodyArea: none(), place: none(), category: none() },
    facility: {
      name: unreadable('The facility name is covered or faded.'),
      documentDate: read(d.d0, handwritten(d.d0)),
      formRevision: none(),
    },
    entries: [],
    payment: {
      amount: check('1,250.00', '₱1,2?0.00', 'One digit is smudged. Check the amount on your receipt.'),
      receiptNumber: read('0004521', 'No. 0004521'),
      paymentDate: read(d.d0, handwritten(d.d0)),
    },
  }
}

/** Removes some readings to simulate a partially read document. */
function degrade(result: ExtractionResult): ExtractionResult {
  const r = structuredClone(result)
  r.outcome = 'partial'
  if (r.documentType === 'treatment_card') {
    r.incident.bodyArea = unreadable()
    r.entries = r.entries.map((e) =>
      e.id === 'row-d3' ? { ...e, description: unreadable('This part of the row is cut off in the photo.') } : e,
    )
  } else if (r.documentType === 'instruction_sheet') {
    r.entries = r.entries.map((e) => (e.id === 'ins-return' ? { ...e, dateWritten: unreadable() } : e))
  }
  return r
}

export function demoExtraction(type: DocType, variant: 'ready' | 'partial' | 'auto'): ExtractionResult {
  const base = type === 'instruction_sheet' ? instructionSheet() : type === 'receipt' ? receipt() : treatmentCard()
  if (variant === 'partial' && base.outcome !== 'partial') return degrade(base)
  return base
}
