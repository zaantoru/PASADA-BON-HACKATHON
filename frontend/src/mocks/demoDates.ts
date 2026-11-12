import { addDays, todayISO } from '@/utils/format'

/** Demo dates are relative to today so the sample journey always looks current. */
export function demoDates() {
  const today = todayISO()
  const exposure = addDays(today, -4)
  const d0 = addDays(today, -3)
  return {
    exposure,
    d0,
    d3: addDays(d0, 3),
    d7: addDays(d0, 7),
    birthday: '1994-08-21',
  }
}

/** Formats dates the way they are handwritten on the sample card (MM/DD/YY). */
export function handwritten(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y.slice(2)}`
}

/** Fictional patient used across all sample documents. */
export const demoPatient = {
  name: 'Andrea M. Villanueva',
  idNumber: 'ABTC-25-04817',
  address: '14 Sampaguita St., Brgy. San Isidro, QC',
  addressNormalized: '14 Sampaguita St., Brgy. San Isidro, Quezon City',
}

export const demoFacilityName = 'Lungsod Animal Bite Treatment Center'
