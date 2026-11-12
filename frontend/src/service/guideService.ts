import { EDU, WHO_CATEGORIES } from '@/features/documents/guide/education'
import { SOURCES } from '@/features/documents/guide/sources'
import type { GuideAction, GuideBlock, GuideContent, GuideInput, GuideSection, Lang } from '@/features/documents/guide/types'
import { formatDate } from '@/utils/format'
import type { FollowUp, StoredDocument } from '@/types/index'
import { findFacilityByName, matchPlace } from '@/service/facilityService'
import { wait } from '@/service/mockConfig'
import { prototypeFlags } from '@/service/prototypeFlags'

/**
 * Builds the guide input from the saved, user-reviewed document. Raw OCR output never reaches
 * this point; follow-ups come only from appointments the user explicitly confirmed.
 */
export function buildGuideInput(doc: StoredDocument, followUps: FollowUp[]): GuideInput {
  const r = doc.reviewed
  return {
    documentId: doc.id,
    documentType: doc.type,
    facilityName: r.facility.name.value,
    documentDate: r.facility.documentDate.value,
    category: r.incident.category.value,
    animal: r.incident.animalType.value,
    bodyArea: r.incident.bodyArea.value,
    place: r.incident.place.value,
    exposureDate: r.incident.exposureDate.value,
    entries: r.entries.map((e) => ({
      rowLabel: e.rowLabel.value,
      date: e.dateWritten.value,
      description: e.description.value,
      entryType: e.entryType,
      savedAs: e.savedAs,
    })),
    confirmedAppointments: followUps
      .filter((f) => f.documentId === doc.id)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((f) => ({ date: f.date, rowLabel: f.rowLabel, facilityName: f.facilityName })),
    hasPayment: !!r.payment && Object.values(r.payment).some((v) => v.value),
  }
}

/** Stable hash of the reviewed input; a mismatch marks the cached guide as needing an update. */
export function hashGuideInput(input: GuideInput) {
  const s = JSON.stringify(input)
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

const L = (lang: Lang, en: string, fil: string) => (lang === 'fil' ? fil : en)
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Abbreviations kept exactly as written, so the guide never expands them on its own. */
function abbreviations(input: GuideInput) {
  const found = new Set<string>()
  for (const e of input.entries) {
    const text = (e.description ?? '').replace(/initials?\s+[A-Z.]+/gi, '')
    for (const m of text.match(/\b[A-Z]{2,}[A-Z0-9]*\b/g) ?? []) found.add(m)
  }
  return [...found]
}

function build(input: GuideInput, lang: Lang): Omit<GuideContent, 'inputHash' | 'generatedAt'> {
  const d = (iso: string | null) => (iso ? formatDate(iso, 'long', lang) : L(lang, 'No date written', 'Walang nakasulat na petsa'))
  const facility = input.facilityName
  const recorded = input.entries.filter((e) => e.entryType === 'recorded_visit' && (e.date || e.description))
  const datesOnly = input.entries.filter((e) => e.entryType === 'scheduled_follow_up' && e.date)
  const blanks = input.entries.filter((e) => !e.date && !e.description)
  const notes = input.entries.filter((e) => e.entryType === 'observation' && e.description)
  const abbr = abbreviations(input)
  const mentionsRig = input.entries.some((e) => /\b(E?RIG|HRIG|immun\w*globulin|mAb)\b/i.test(e.description ?? ''))
  const appt = input.confirmedAppointments
  const who = SOURCES['who-rabies']

  // A. What the card records
  const cardBlocks: GuideBlock[] = []
  if (recorded.length)
    cardBlocks.push({
      kind: 'from_card',
      heading: L(lang, 'Treatment entries written on the card', 'Mga gamutang nakasulat sa card'),
      items: recorded.map((e) => ({
        label: `${e.rowLabel ?? L(lang, 'Entry', 'Entry')} · ${d(e.date)}`,
        detail: e.description ?? undefined,
        tag: e.savedAs === 'visit' ? L(lang, 'Saved as a visit', 'Na-save bilang pagbisita') : undefined,
      })),
    })
  if (datesOnly.length)
    cardBlocks.push({
      kind: 'from_card',
      heading: L(lang, 'Dates written without a treatment entry', 'Mga petsang walang kasamang gamutan'),
      items: datesOnly.map((e) => ({
        label: `${e.rowLabel ?? 'Entry'} · ${d(e.date)}`,
        tag:
          e.savedAs === 'follow_up'
            ? L(lang, 'You confirmed this as an appointment', 'Kinumpirma mong appointment ito')
            : L(lang, 'Not confirmed as an appointment', 'Hindi kinumpirmang appointment'),
      })),
    })
  if (blanks.length)
    cardBlocks.push({
      kind: 'from_card',
      heading: L(lang, 'Printed rows with nothing written', 'Mga nakaimprentang hanay na walang sulat'),
      text: L(
        lang,
        `${blanks.map((b) => b.rowLabel ?? '—').join(', ')} — these are printed labels on the form. They aren’t visits or appointments by themselves.`,
        `${blanks.map((b) => b.rowLabel ?? '—').join(', ')} — nakaimprentang label lang ito sa form. Hindi ito pagbisita o appointment.`,
      ),
    })
  if (notes.length)
    cardBlocks.push({
      kind: 'from_card',
      heading: L(lang, 'Notes from the clinic', 'Mga tala mula sa clinic'),
      items: notes.map((n) => ({ label: n.description!, detail: n.rowLabel ?? undefined })),
    })
  if (abbr.length)
    cardBlocks.push({
      kind: 'needs_confirmation',
      heading: L(lang, 'Shown exactly as written', 'Ipinapakita nang eksakto'),
      text: L(
        lang,
        `${abbr.join(', ')} — PASADA doesn’t expand abbreviations on your card. Ask your clinic if you’re not sure what they mean.`,
        `${abbr.join(', ')} — hindi binibigyang-kahulugan ng PASADA ang mga daglat sa card. Magtanong sa clinic kung hindi ka sigurado.`,
      ),
    })
  if (input.documentType === 'treatment_card' && !mentionsRig)
    cardBlocks.push({
      kind: 'needs_confirmation',
      heading: L(lang, 'Rabies immune globulin (RIG): Not recorded', 'Rabies immune globulin (RIG): Hindi nakatala'),
      text: L(
        lang,
        'Nothing about RIG is written on this card. A blank doesn’t mean it wasn’t given or isn’t needed — ask your clinic.',
        'Walang nakasulat tungkol sa RIG sa card na ito. Hindi ibig sabihin ng blangko na hindi ito ibinigay o hindi kailangan — magtanong sa clinic.',
      ),
    })
  const card: GuideSection = {
    title: L(lang, 'What your card records', 'Ano ang nakatala sa card mo'),
    summary: L(
      lang,
      `${facility ? `From ${facility}. ` : ''}${plural(recorded.length, 'treatment entry is', 'treatment entries are')} written on it${blanks.length ? `, and ${plural(blanks.length, 'printed row is', 'printed rows are')} blank` : ''}.`,
      `${facility ? `Mula sa ${facility}. ` : ''}May ${recorded.length} gamutang nakasulat${blanks.length ? ` at ${blanks.length} blangkong nakaimprentang hanay` : ''}.`,
    ),
    blocks: cardBlocks,
  }

  // B. Exposure category
  const cat = input.category && ['I', 'II', 'III'].includes(input.category) ? (input.category as 'I' | 'II' | 'III') : null
  const categoryBlocks: GuideBlock[] = cat
    ? [
        {
          kind: 'from_card',
          heading: `Category ${cat}`,
          text: L(lang, 'Marked by your clinic on this card.', 'Minarkahan ng iyong clinic sa card na ito.'),
        },
        {
          kind: 'general',
          text: WHO_CATEGORIES[cat][lang],
          more: [EDU.categoryIntro[lang], ...(['I', 'II', 'III'] as const).map((c) => WHO_CATEGORIES[c][lang])],
          source: who,
        },
        { kind: 'needs_confirmation', text: EDU.clinicDecides[lang] },
      ]
    : [
        {
          kind: 'needs_confirmation',
          heading: L(lang, 'Category not recorded', 'Walang nakatalang category'),
          text: L(
            lang,
            'No exposure category is recorded on this card. PASADA doesn’t assign one — ask your treatment center.',
            'Walang nakatalang exposure category sa card na ito. Hindi nagtatakda ng category ang PASADA — magtanong sa iyong treatment center.',
          ),
        },
        { kind: 'general', text: EDU.categoryIntro[lang], more: (['I', 'II', 'III'] as const).map((c) => WHO_CATEGORIES[c][lang]), source: who },
      ]
  const category: GuideSection = {
    title: L(lang, 'Your exposure category', 'Ang iyong exposure category'),
    summary: cat
      ? L(lang, `Your clinic marked Category ${cat}.`, `Minarkahan ng clinic ang Category ${cat}.`)
      : L(lang, 'No category is written on this card.', 'Walang category na nakasulat sa card na ito.'),
    blocks: categoryBlocks,
  }

  // C. Follow-up: only explicitly confirmed, clinic-written dates
  const followBlocks: GuideBlock[] = []
  if (recorded.length)
    followBlocks.push({
      kind: 'from_card',
      heading: L(lang, 'Visits already recorded', 'Mga naitalang pagbisita'),
      text: L(lang, 'These are past entries, not upcoming appointments.', 'Mga nakaraang entry ito, hindi paparating na appointment.'),
      items: recorded.map((e) => ({ label: `${e.rowLabel ?? 'Entry'} · ${d(e.date)}` })),
    })
  if (!appt.length)
    followBlocks.push({
      kind: 'needs_confirmation',
      text: L(
        lang,
        'Your next appointment isn’t clear from this card. Please confirm it with your treatment center.',
        'Hindi malinaw sa card na ito ang susunod mong appointment. Pakikumpirma sa iyong treatment center.',
      ),
    })
  followBlocks.push({
    kind: 'general',
    text: L(
      lang,
      'PASADA shows only dates your clinic wrote and you confirmed. It doesn’t work out a schedule from vaccine names, categories, or printed rows.',
      'Ipinapakita lang ng PASADA ang mga petsang isinulat ng clinic at kinumpirma mo. Hindi ito gumagawa ng iskedyul mula sa pangalan ng bakuna, category, o nakaimprentang hanay.',
    ),
  })
  const followUp: GuideSection = {
    title: L(lang, 'Your next recorded appointment', 'Ang susunod mong nakatalang appointment'),
    summary: appt.length
      ? L(lang, `Your clinic wrote ${d(appt[0].date)}, and you confirmed it.`, `Isinulat ng clinic ang ${d(appt[0].date)}, at kinumpirma mo ito.`)
      : L(lang, 'No confirmed appointment date yet.', 'Wala pang kinumpirmang petsa ng appointment.'),
    blocks: followBlocks,
  }

  // D. What to watch for
  const trusted = findFacilityByName(facility)
  const watch: GuideSection = {
    title: L(lang, 'What to watch for and who to call', 'Ano ang dapat bantayan at sino ang tatawagan'),
    summary: L(lang, 'A few things worth knowing, and where to ask.', 'Ilang bagay na dapat malaman, at kung saan magtatanong.'),
    blocks: [
      { kind: 'general', text: EDU.incubation[lang], more: [EDU.earlySigns[lang]], source: who },
      { kind: 'general', text: EDU.washWound[lang], source: who },
      { kind: 'needs_confirmation', text: EDU.whereToAsk[lang] },
    ],
  }

  // E. Costs and assistance
  const costs: GuideSection = {
    title: L(lang, 'Help with costs', 'Tulong sa gastos'),
    summary: L(lang, 'Where you can ask about financial assistance.', 'Kung saan puwedeng magtanong tungkol sa tulong pinansyal.'),
    blocks: [
      { kind: 'general', text: EDU.assistanceIntro[lang] },
      {
        kind: 'general',
        heading: L(lang, 'What to prepare for an inquiry', 'Ano ang ihahanda sa pagtatanong'),
        items: [
          { label: L(lang, 'This treatment card', 'Ang treatment card na ito') },
          { label: L(lang, 'A valid government-issued ID', 'Valid na government-issued ID') },
          { label: L(lang, 'Any receipts, prescriptions, or requests you have', 'Mga resibo, reseta, o request na mayroon ka') },
        ],
        more: [EDU.assistanceExample[lang]],
        source: SOURCES['doh-charter'],
      },
    ],
  }

  const near = matchPlace(input.place)
  const actions: GuideAction[] = [
    { type: 'open_document_details', section: 'card', panelSection: 'visits' },
    ...(appt.length ? [{ type: 'set_reminder', section: 'followUp' } as GuideAction] : []),
    ...(trusted ? [{ type: 'open_facility', section: 'watch', facilityId: trusted.id, facilityName: trusted.name } as GuideAction] : []),
    ...(trusted?.phone ? [{ type: 'call_facility', section: 'watch', facilityId: trusted.id, phone: trusted.phone, facilityName: trusted.name } as GuideAction] : []),
    { type: 'show_public_centers', section: 'costs', placeId: near?.id, placeName: near?.name },
    { type: 'view_assistance', section: 'costs' },
  ]

  const greeting = L(
    lang,
    'Hi! I’ve reviewed the details you confirmed. Let’s understand your card and your next steps.',
    'Kumusta! Nasuri ko na ang mga detalyeng kinumpirma mo. Unawain natin ang iyong card at ang mga susunod na hakbang.',
  )
  const overview = appt.length
    ? L(lang, `${plural(recorded.length, 'visit', 'visits')} recorded. Next recorded appointment: ${d(appt[0].date)}.`, `${recorded.length} naitalang pagbisita. Susunod na appointment: ${d(appt[0].date)}.`)
    : L(lang, `${plural(recorded.length, 'visit', 'visits')} recorded. Your next appointment needs confirming with the clinic.`, `${recorded.length} naitalang pagbisita. Kailangang kumpirmahin sa clinic ang susunod na appointment.`)

  const tour: GuideContent['tour'] = [
    { target: 'card', title: card.title, body: L(lang, 'Here’s what’s written on your card — treatment entries, dates, and the rows left blank.', 'Narito ang nakasulat sa card mo — mga gamutan, petsa, at mga hanay na blangko.') },
    { target: 'category', title: category.title, body: cat ? L(lang, `Your clinic marked Category ${cat}. Here’s what that category generally means.`, `Minarkahan ng clinic ang Category ${cat}. Narito ang karaniwang kahulugan nito.`) : L(lang, 'No category is written. Your clinic can tell you.', 'Walang nakasulat na category. Masasabi ito ng clinic mo.') },
    { target: 'followUp', title: followUp.title, body: appt.length ? L(lang, 'This is the date your clinic wrote and you confirmed. You can set a reminder for it.', 'Ito ang petsang isinulat ng clinic at kinumpirma mo. Puwede kang mag-set ng paalala.') : L(lang, 'No appointment was confirmed, so check the date with your treatment center.', 'Walang kinumpirmang appointment, kaya alamin ang petsa sa treatment center.') },
    { target: 'watch', title: watch.title, body: L(lang, 'General information on symptoms and wound care, and who to contact.', 'Pangkalahatang impormasyon tungkol sa sintomas at pag-aalaga ng sugat, at kung sino ang tatawagan.') },
    { target: 'costs', title: costs.title, body: L(lang, 'Public hospitals may help with costs. You can look for treatment centers and assistance offices next.', 'Maaaring tumulong sa gastos ang mga pampublikong ospital. Puwede kang maghanap ng treatment center at assistance office.') },
  ]

  return { lang, isDemo: true, greeting, overview, sections: { card, category, followUp, watch, costs }, tour, actions }
}

/**
 * Demo stand-in for the Lumen AI Chat guide endpoint. Deterministic: it rephrases reviewed
 * values and vetted education into short cards. Replace with the backend call; keep the shape.
 */
export async function generateGuide(input: GuideInput, lang: Lang): Promise<GuideContent> {
  await wait(1100)
  // Prototype toggle: fail the next generation once so the retry state can be reviewed.
  if (prototypeFlags.get().guideFailsOnce) {
    prototypeFlags.set({ guideFailsOnce: false })
    throw new Error('The guide service didn’t respond.')
  }
  return { ...build(input, lang), inputHash: hashGuideInput(input), generatedAt: new Date().toISOString() }
}
