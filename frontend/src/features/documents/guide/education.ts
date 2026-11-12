import type { Lang } from '@/features/documents/guide/types'

/**
 * General education, summarized from the WHO Rabies fact sheet. Kept separate from
 * patient data so it stays available even when guide generation fails.
 */
export const WHO_CATEGORIES: Record<'I' | 'II' | 'III', Record<Lang, string>> = {
  I: {
    en: 'Category I: touching or feeding animals, or animal licks on intact skin. WHO describes this as no exposure.',
    fil: 'Category I: paghawak o pagpapakain sa hayop, o pagdila ng hayop sa balat na walang sugat. Ayon sa WHO, hindi ito itinuturing na exposure.',
  },
  II: {
    en: 'Category II: nibbling of uncovered skin, or minor scratches or abrasions without bleeding.',
    fil: 'Category II: pagkagat nang bahagya sa balat na walang takip, o maliliit na kalmot o gasgas na hindi dumudugo.',
  },
  III: {
    en: 'Category III: single or multiple bites or scratches that break the skin, saliva on broken skin or mucous membranes (such as eyes or mouth), or direct contact with bats. WHO describes this as severe exposure.',
    fil: 'Category III: isa o higit pang kagat o kalmot na tumagos sa balat, laway ng hayop sa sugat o sa mata o bibig, o direktang kontak sa paniki. Ayon sa WHO, ito ay malubhang exposure.',
  },
}

export const EDU = {
  categoryIntro: {
    en: 'WHO groups contact with a possibly rabid animal into three categories:',
    fil: 'Hinahati ng WHO sa tatlong category ang kontak sa hayop na posibleng may rabies:',
  },
  clinicDecides: {
    en: 'Your clinic assessed your exposure and decides your treatment. Ask them if you have questions about your category.',
    fil: 'Ang iyong clinic ang nagsuri sa exposure mo at nagpapasya sa iyong gamutan. Magtanong sa kanila kung may tanong ka tungkol sa iyong category.',
  },
  incubation: {
    en: 'Rabies symptoms can take time to appear — typically 2–3 months, but anywhere from one week to one year.',
    fil: 'Maaaring matagal bago lumabas ang sintomas ng rabies — karaniwang 2–3 buwan, pero puwedeng isang linggo hanggang isang taon.',
  },
  earlySigns: {
    en: 'Early signs can include fever, pain, or unusual tingling, pricking, or burning where you were bitten or scratched.',
    fil: 'Kabilang sa mga unang senyales ang lagnat, pananakit, o kakaibang pangingilig, pagtusok, o pagkapaso sa bahaging kinagat o kinalmot.',
  },
  washWound: {
    en: 'If you are bitten or scratched again, wash the wound right away with soap and water for at least 15 minutes, then seek medical attention.',
    fil: 'Kung makagat o makalmot ka ulit, hugasan agad ang sugat ng sabon at tubig nang hindi bababa sa 15 minuto, saka magpatingin.',
  },
  whereToAsk: {
    en: 'Contact your treatment center with questions about your card or next visit. If you feel very unwell, call 911 or go to the nearest emergency room.',
    fil: 'Tumawag sa iyong treatment center kung may tanong tungkol sa card o susunod na pagbisita. Kung masama ang pakiramdam mo, tumawag sa 911 o pumunta sa pinakamalapit na emergency room.',
  },
  assistanceIntro: {
    en: 'Public hospitals may have a Malasakit Center or a medical social service office where you can ask about financial assistance. Each request is assessed, so approval isn’t guaranteed.',
    fil: 'Maaaring may Malasakit Center o medical social service office ang mga pampublikong ospital kung saan puwede kang magtanong tungkol sa tulong pinansyal. Sinusuri ang bawat request, kaya hindi garantisado ang pag-apruba.',
  },
  assistanceExample: {
    en: 'Example from one published hospital checklist: a Medical Social Work referral letter, a government-issued ID, and photocopies of prescriptions or requests. Requirements vary by office — ask before you go.',
    fil: 'Halimbawa mula sa checklist ng isang ospital: referral letter mula sa Medical Social Work, government-issued ID, at photocopy ng reseta o request. Iba-iba ang requirements bawat opisina — magtanong muna bago pumunta.',
  },
}
