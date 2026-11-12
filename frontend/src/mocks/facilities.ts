import type { Facility, PlaceOption } from '@/types/index'

/**
 * Demo facility directory. Names, numbers, and reviews are fictional.
 * Phone numbers use the 555 range reserved for examples.
 */
const coreServices = ['Animal-bite consultation', 'Wound washing and care', 'Anti-rabies vaccination']

export const demoFacilities: Facility[] = [
  {
    id: 'fac-lungsod',
    name: 'Lungsod Animal Bite Treatment Center',
    ownership: 'public',
    address: 'East Ave. corner Matalino St., Brgy. Pinyahan',
    area: 'Diliman',
    city: 'Quezon City',
    lat: 14.6436,
    lng: 121.0479,
    phone: '(02) 8555-0142',
    services: [...coreServices, 'Rabies immune globulin', 'Tetanus vaccination'],
    demo: true,
    reviews: [
      { id: 'r1', rating: 4, text: 'Staff explained each step clearly and wrote my return date on the card. The morning queue was long.', author: 'Demo reviewer A', date: '2025-09-14' },
      { id: 'r2', rating: 5, text: 'Clean waiting area. They reminded me to bring my card next time.', author: 'Demo reviewer B', date: '2025-08-02' },
      { id: 'r3', rating: 3, text: 'Helpful nurses, but signage to the bite center was hard to find.', author: 'Demo reviewer C', date: '2025-06-21' },
    ],
  },
  {
    id: 'fac-sanroque',
    name: 'San Roque District Health Center',
    ownership: 'public',
    address: '18th Ave., Brgy. San Roque',
    area: 'Cubao',
    city: 'Quezon City',
    lat: 14.6201,
    lng: 121.0561,
    phone: '(02) 8555-0178',
    services: coreServices,
    demo: true,
    reviews: [
      { id: 'r4', rating: 4, text: 'Near the MRT. Friendly front desk.', author: 'Demo reviewer D', date: '2025-07-30' },
    ],
  },
  {
    id: 'fac-maginhawa',
    name: 'Maginhawa Family Clinic',
    ownership: 'private',
    address: '82 Maginhawa St., Teachers Village East',
    area: 'Teachers Village',
    city: 'Quezon City',
    lat: 14.6454,
    lng: 121.0628,
    phone: '0917 555 0133',
    services: ['Animal-bite consultation', 'Wound washing and care', 'Anti-rabies vaccination', 'Tetanus vaccination'],
    demo: true,
    reviews: [
      { id: 'r5', rating: 5, text: 'Short wait on a weekday afternoon. Doctor answered all my questions.', author: 'Demo reviewer E', date: '2025-09-01' },
      { id: 'r6', rating: 4, text: 'Comfortable clinic. Call ahead to ask about schedules.', author: 'Demo reviewer F', date: '2025-05-11' },
    ],
  },
  {
    id: 'fac-sampaloc',
    name: 'Sampaloc Community Hospital',
    ownership: 'public',
    address: 'Lacson Ave., Brgy. 470',
    area: 'Sampaloc',
    city: 'Manila',
    lat: 14.6084,
    lng: 120.9938,
    phone: '(02) 8555-0119',
    services: [...coreServices, 'Rabies immune globulin'],
    demo: true,
    reviews: [
      { id: 'r7', rating: 3, text: 'Busy on Mondays. Bring water and your documents.', author: 'Demo reviewer G', date: '2025-08-18' },
      { id: 'r8', rating: 4, text: 'Nurses were patient with my child.', author: 'Demo reviewer H', date: '2025-04-03' },
    ],
  },
  {
    id: 'fac-bayanihan',
    name: 'Bayanihan Medical Center',
    ownership: 'private',
    address: 'Taft Ave., Ermita',
    area: 'Ermita',
    city: 'Manila',
    lat: 14.5831,
    lng: 120.9848,
    phone: '(02) 8555-0160',
    services: ['Animal-bite consultation', 'Wound washing and care', 'Anti-rabies vaccination'],
    demo: true,
    reviews: [],
  },
  {
    id: 'fac-kapitolyo',
    name: 'Kapitolyo Animal Bite Clinic',
    ownership: 'private',
    address: 'East Capitol Dr., Brgy. Kapitolyo',
    area: 'Kapitolyo',
    city: 'Pasig',
    lat: 14.5701,
    lng: 121.0596,
    phone: '0918 555 0155',
    services: coreServices,
    demo: true,
    reviews: [
      { id: 'r9', rating: 4, text: 'Easy to find and the staff were organized.', author: 'Demo reviewer I', date: '2025-09-20' },
    ],
  },
  {
    id: 'fac-pasigbayan',
    name: 'Pasig Bayan Health Center',
    ownership: 'public',
    address: 'Caruncho Ave., Brgy. San Nicolas',
    area: 'San Nicolas',
    city: 'Pasig',
    lat: 14.5612,
    lng: 121.0798,
    phone: '(02) 8555-0127',
    services: [...coreServices, 'Tetanus vaccination'],
    demo: true,
    reviews: [
      { id: 'r10', rating: 4, text: 'Clear instructions sheet given after my visit.', author: 'Demo reviewer J', date: '2025-07-07' },
      { id: 'r11', rating: 3, text: 'Limited seating. Arrive early.', author: 'Demo reviewer K', date: '2025-03-29' },
    ],
  },
  {
    id: 'fac-poblacion',
    name: 'Poblacion Wellness Clinic',
    ownership: 'private',
    address: 'J.P. Rizal St., Brgy. Poblacion',
    area: 'Poblacion',
    city: 'Makati',
    lat: 14.5653,
    lng: 121.0307,
    phone: '0917 555 0188',
    services: ['Animal-bite consultation', 'Wound washing and care'],
    demo: true,
    reviews: [
      { id: 'r12', rating: 5, text: 'Very accommodating staff.', author: 'Demo reviewer L', date: '2025-08-25' },
    ],
  },
  {
    id: 'fac-marikina',
    name: 'Marikina Valley District Hospital',
    ownership: 'public',
    address: 'Bayan-Bayanan Ave., Brgy. Concepcion Uno',
    area: 'Concepcion',
    city: 'Marikina',
    lat: 14.6507,
    lng: 121.1029,
    phone: '(02) 8555-0193',
    services: [...coreServices, 'Rabies immune globulin', 'Tetanus vaccination'],
    demo: true,
    reviews: [
      { id: 'r13', rating: 4, text: 'Orderly queue with numbers. Bring a pen for forms.', author: 'Demo reviewer M', date: '2025-06-12' },
    ],
  },
  {
    id: 'fac-caloocan',
    name: 'Caloocan North Health Center',
    ownership: 'public',
    address: 'Phase 1, Brgy. Bagong Silang',
    area: 'Bagong Silang',
    city: 'Caloocan',
    lat: 14.7712,
    lng: 121.0447,
    phone: '(02) 8555-0104',
    services: coreServices,
    demo: true,
    reviews: [],
  },
  {
    id: 'fac-taguig',
    name: 'Lakeside Medical Clinic',
    ownership: 'private',
    address: 'M.L. Quezon Ave., Brgy. Ususan',
    area: 'Ususan',
    city: 'Taguig',
    lat: 14.5352,
    lng: 121.0687,
    phone: '0919 555 0111',
    services: ['Animal-bite consultation', 'Wound washing and care', 'Anti-rabies vaccination'],
    demo: true,
    reviews: [
      { id: 'r14', rating: 4, text: 'They gave me a printed instruction sheet. Parking is limited.', author: 'Demo reviewer N', date: '2025-09-09' },
    ],
  },
]

export const DOH_CHARTER_URL =
  'https://ecs.doh.gov.ph/images/CITIZENS_CHARTER/CC2026/CC_Handbook_9th_edition_March_2026.pdf'
export const DOH_CHARTER_NAME = 'Eversley Childs Sanitarium and General Hospital Citizen’s Charter 2026 (9th ed.)'
/** Date the PASADA team last read the source document. */
export const DOH_CHARTER_CHECKED = '2026-11-12'

/**
 * Sourced listing: details below are copied from the hospital's published Citizen's Charter.
 * The charter lists no street address or phone number, so the map pin is approximate.
 */
export const sourcedFacilities: Facility[] = [
  {
    id: 'fac-ecsgh-abtc',
    name: 'Eversley Childs Sanitarium and General Hospital — Animal Bite Treatment Center',
    ownership: 'public',
    address: 'Street address not listed in the source — confirm with the hospital',
    area: 'Northern Cebu',
    city: 'Cebu',
    lat: 10.3647,
    lng: 123.9603,
    approximateLocation: true,
    phone: null,
    services: [
      'Wound cleansing',
      'Risk assessment',
      'Anti-rabies vaccine',
      'Rabies immunoglobulin when indicated',
      'Tetanus prophylaxis',
      'Counseling on wound care and follow-up doses',
    ],
    reviews: [],
    demo: false,
    sourced: {
      hours: 'Monday and Thursday, 8:00 AM to 4:00 PM, except holidays',
      cost: 'PhilHealth members: no fee listed. Non-PhilHealth members: PHP 250.00 for new patients, PHP 200.00 for old patients (user’s fee, injection fee, and ABTC card for new patients).',
      costNote: 'The charter states that patients unable to pay proceed to the Medical Social Work Department.',
      sourceName: DOH_CHARTER_NAME,
      sourceUrl: DOH_CHARTER_URL,
      lastChecked: DOH_CHARTER_CHECKED,
    },
  },
]

export const allFacilities: Facility[] = [...demoFacilities, ...sourcedFacilities]

export const demoPlaces: PlaceOption[] = [
  { id: 'qc', name: 'Quezon City', lat: 14.6365, lng: 121.0437 },
  { id: 'cubao', name: 'Cubao, Quezon City', lat: 14.6195, lng: 121.0537 },
  { id: 'manila', name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { id: 'makati', name: 'Makati', lat: 14.5547, lng: 121.0244 },
  { id: 'pasig', name: 'Pasig', lat: 14.5764, lng: 121.0851 },
  { id: 'mandaluyong', name: 'Mandaluyong', lat: 14.5794, lng: 121.0359 },
  { id: 'marikina', name: 'Marikina', lat: 14.6507, lng: 121.1029 },
  { id: 'taguig', name: 'Taguig', lat: 14.5176, lng: 121.0509 },
  { id: 'caloocan', name: 'Caloocan', lat: 14.6507, lng: 120.9667 },
]

export const DEFAULT_CENTER = { lat: 14.6, lng: 121.035 }
