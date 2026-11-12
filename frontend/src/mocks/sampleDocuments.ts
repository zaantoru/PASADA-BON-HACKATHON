import type { DocType } from '@/types/index'
import { demoDates, demoFacilityName, demoPatient, handwritten } from '@/mocks/demoDates'

const HAND = "'Segoe Print','Bradley Hand','Comic Sans MS',cursive"
const PRINT = 'Arial, Helvetica, sans-serif'
const INK = '#1d3fa0'

function watermark(w: number, h: number) {
  return `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="${PRINT}" font-size="54" font-weight="700" fill="#2B6AD0" opacity="0.07" transform="rotate(-28 ${w / 2} ${h / 2})">SAMPLE · FICTIONAL</text>`
}

function box(x: number, y: number, checked = false) {
  return `<rect x="${x}" y="${y}" width="16" height="16" fill="#fff" stroke="#333" stroke-width="1.4"/>${
    checked ? `<path d="M${x + 3} ${y + 8} l4 5 l8 -11" stroke="${INK}" stroke-width="2.6" fill="none"/>` : ''
  }`
}

function treatmentCard() {
  const d = demoDates()
  const rows = [
    ['D0', handwritten(d.d0), 'PVRV 0.1mL ID x2', 'RM'],
    ['D3', handwritten(d.d3), 'PVRV 0.1mL ID x2', 'RM'],
    ['D7', handwritten(d.d7), '', ''],
    ['D14', '', '', ''],
    ['D28', '', '', ''],
  ]
  const tableTop = 560
  const rowH = 44
  const rowsSvg = rows
    .map(([label, date, dose, init], i) => {
      const y = tableTop + 40 + i * rowH
      return `
      <line x1="44" y1="${y + rowH}" x2="596" y2="${y + rowH}" stroke="#999" stroke-width="1"/>
      <text x="62" y="${y + 28}" font-family="${PRINT}" font-size="15" font-weight="700" fill="#222">${label}</text>
      <text x="132" y="${y + 29}" font-family="${HAND}" font-size="17" fill="${INK}">${date}</text>
      <text x="262" y="${y + 29}" font-family="${HAND}" font-size="16" fill="${INK}">${dose}</text>
      <text x="520" y="${y + 29}" font-family="${HAND}" font-size="17" fill="${INK}">${init}</text>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900">
  <rect width="640" height="900" fill="#fbfaf4"/>
  ${watermark(640, 900)}
  <rect x="22" y="22" width="596" height="856" fill="none" stroke="#1F4591" stroke-width="2"/>
  <text x="320" y="58" text-anchor="middle" font-family="${PRINT}" font-size="12" letter-spacing="2" fill="#555">SAMPLE FORM · FOR DEMONSTRATION ONLY</text>
  <text x="320" y="90" text-anchor="middle" font-family="${PRINT}" font-size="24" font-weight="700" fill="#1F4591">ANIMAL BITE TREATMENT CARD</text>
  <text x="320" y="116" text-anchor="middle" font-family="${PRINT}" font-size="14" fill="#333">${demoFacilityName}</text>
  <line x1="44" y1="134" x2="596" y2="134" stroke="#1F4591" stroke-width="1.5"/>

  <text x="44" y="170" font-family="${PRINT}" font-size="13" fill="#444">Name</text>
  <line x1="96" y1="174" x2="596" y2="174" stroke="#999"/>
  <text x="104" y="168" font-family="${HAND}" font-size="20" fill="${INK}">${demoPatient.name}</text>

  <text x="44" y="212" font-family="${PRINT}" font-size="13" fill="#444">Birthday</text>
  <line x1="110" y1="216" x2="300" y2="216" stroke="#999"/>
  <text x="118" y="210" font-family="${HAND}" font-size="18" fill="${INK}">08/21/94</text>
  <text x="320" y="212" font-family="${PRINT}" font-size="13" fill="#444">Card No.</text>
  <line x1="384" y1="216" x2="596" y2="216" stroke="#999"/>
  <text x="392" y="210" font-family="${HAND}" font-size="17" fill="${INK}">${demoPatient.idNumber}</text>

  <text x="44" y="254" font-family="${PRINT}" font-size="13" fill="#444">Address</text>
  <line x1="104" y1="258" x2="596" y2="258" stroke="#999"/>
  <text x="112" y="252" font-family="${HAND}" font-size="17" fill="${INK}">${demoPatient.address}</text>

  <text x="44" y="296" font-family="${PRINT}" font-size="13" fill="#444">Date issued</text>
  <line x1="126" y1="300" x2="300" y2="300" stroke="#999"/>
  <text x="134" y="294" font-family="${HAND}" font-size="18" fill="${INK}">${handwritten(d.d0)}</text>

  <rect x="44" y="318" width="552" height="1.5" fill="#1F4591"/>
  <text x="44" y="346" font-family="${PRINT}" font-size="13" font-weight="700" fill="#1F4591">HISTORY OF EXPOSURE</text>

  <text x="44" y="382" font-family="${PRINT}" font-size="13" fill="#444">Date of exposure</text>
  <line x1="160" y1="386" x2="300" y2="386" stroke="#999"/>
  <text x="168" y="380" font-family="${HAND}" font-size="18" fill="${INK}">${handwritten(d.exposure)}</text>
  <text x="320" y="382" font-family="${PRINT}" font-size="13" fill="#444">Place</text>
  <line x1="362" y1="386" x2="596" y2="386" stroke="#999"/>
  <text x="370" y="380" font-family="${HAND}" font-size="17" fill="${INK}">Brgy. Malinis, QC</text>
  <ellipse cx="438" cy="374" rx="22" ry="11" fill="#8a8a8a" opacity="0.55"/>

  <text x="44" y="424" font-family="${PRINT}" font-size="13" fill="#444">Animal</text>
  ${box(104, 411)}<text x="126" y="424" font-family="${PRINT}" font-size="13" fill="#222">Dog</text>
  ${box(172, 411)}<text x="194" y="424" font-family="${PRINT}" font-size="13" fill="#222">Cat</text>
  ${box(240, 411)}<text x="262" y="424" font-family="${PRINT}" font-size="13" fill="#222">Others ________</text>
  <path d="M146 418 l10 9 l14 -20" stroke="${INK}" stroke-width="2.6" fill="none"/>

  <text x="44" y="466" font-family="${PRINT}" font-size="13" fill="#444">Site of bite</text>
  <line x1="124" y1="470" x2="350" y2="470" stroke="#999"/>
  <text x="132" y="464" font-family="${HAND}" font-size="18" fill="${INK}">L leg (calf)</text>

  <text x="44" y="508" font-family="${PRINT}" font-size="13" fill="#444">Category</text>
  ${box(116, 495)}<text x="138" y="508" font-family="${PRINT}" font-size="13" fill="#222">I</text>
  ${box(160, 495, true)}<text x="182" y="508" font-family="${PRINT}" font-size="13" fill="#222">II</text>
  ${box(210, 495)}<text x="232" y="508" font-family="${PRINT}" font-size="13" fill="#222">III</text>

  <rect x="44" y="${tableTop}" width="552" height="40" fill="#e6eefb" stroke="#1F4591"/>
  <text x="62" y="${tableTop + 26}" font-family="${PRINT}" font-size="13" font-weight="700" fill="#1F4591">DAY</text>
  <text x="132" y="${tableTop + 26}" font-family="${PRINT}" font-size="13" font-weight="700" fill="#1F4591">DATE</text>
  <text x="262" y="${tableTop + 26}" font-family="${PRINT}" font-size="13" font-weight="700" fill="#1F4591">VACCINE / DOSE / ROUTE</text>
  <text x="508" y="${tableTop + 26}" font-family="${PRINT}" font-size="13" font-weight="700" fill="#1F4591">INITIALS</text>
  ${rowsSvg}
  <line x1="120" y1="${tableTop}" x2="120" y2="${tableTop + 40 + rows.length * rowH}" stroke="#999"/>
  <line x1="250" y1="${tableTop}" x2="250" y2="${tableTop + 40 + rows.length * rowH}" stroke="#999"/>
  <line x1="496" y1="${tableTop}" x2="496" y2="${tableTop + 40 + rows.length * rowH}" stroke="#999"/>
  <rect x="44" y="${tableTop}" width="552" height="${40 + rows.length * rowH}" fill="none" stroke="#1F4591"/>

  <text x="44" y="856" font-family="${PRINT}" font-size="11" fill="#666">Form rev. 03-2021</text>
  <text x="596" y="856" text-anchor="end" font-family="${PRINT}" font-size="11" fill="#666">Bring this card on every visit</text>
</svg>`
}

function instructionSheet() {
  const d = demoDates()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="860" viewBox="0 0 640 860">
  <rect width="640" height="860" fill="#ffffff"/>
  ${watermark(640, 860)}
  <text x="44" y="62" font-family="${PRINT}" font-size="12" letter-spacing="2" fill="#555">SAMPLE FORM · FOR DEMONSTRATION ONLY</text>
  <text x="44" y="96" font-family="${PRINT}" font-size="22" font-weight="700" fill="#1F4591">Patient Instructions — Animal Bite</text>
  <text x="44" y="122" font-family="${PRINT}" font-size="14" fill="#333">${demoFacilityName}</text>
  <line x1="44" y1="140" x2="596" y2="140" stroke="#1F4591" stroke-width="1.5"/>
  <text x="44" y="178" font-family="${PRINT}" font-size="13" fill="#444">Patient</text>
  <text x="110" y="178" font-family="${HAND}" font-size="19" fill="${INK}">${demoPatient.name}</text>
  <text x="44" y="214" font-family="${PRINT}" font-size="13" fill="#444">Date</text>
  <text x="110" y="214" font-family="${HAND}" font-size="18" fill="${INK}">${handwritten(d.d0)}</text>
  <text x="320" y="214" font-family="${PRINT}" font-size="13" fill="#444">Exposure</text>
  <text x="392" y="214" font-family="${HAND}" font-size="18" fill="${INK}">${handwritten(d.exposure)} · Dog bite, L leg</text>
  <text x="44" y="270" font-family="${PRINT}" font-size="15" font-weight="700" fill="#1F4591">Instructions</text>
  <text x="58" y="304" font-family="${PRINT}" font-size="14" fill="#222">1. Wash the wound with soap and running water.</text>
  <text x="58" y="332" font-family="${PRINT}" font-size="14" fill="#222">2. Do not apply ointments or herbal remedies unless advised.</text>
  <text x="58" y="360" font-family="${PRINT}" font-size="14" fill="#222">3. Observe the animal for 14 days and report changes.</text>
  <text x="58" y="388" font-family="${PRINT}" font-size="14" fill="#222">4. Bring your treatment card on every visit.</text>
  <rect x="44" y="430" width="552" height="74" rx="8" fill="#eef4fd" stroke="#2B6AD0"/>
  <text x="64" y="462" font-family="${PRINT}" font-size="14" font-weight="700" fill="#1F4591">Return on:</text>
  <text x="160" y="463" font-family="${HAND}" font-size="22" fill="${INK}">${handwritten(d.d3)}</text>
  <text x="64" y="490" font-family="${PRINT}" font-size="12" fill="#444">Bring this sheet and your treatment card.</text>
  <text x="44" y="820" font-family="${PRINT}" font-size="11" fill="#666">IS-AB rev. 2022</text>
</svg>`
}

function receipt() {
  const d = demoDates()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="700" viewBox="0 0 520 700">
  <rect width="520" height="700" fill="#fffdf6"/>
  ${watermark(520, 700)}
  <text x="260" y="56" text-anchor="middle" font-family="${PRINT}" font-size="11" letter-spacing="2" fill="#555">SAMPLE RECEIPT · FICTIONAL</text>
  <text x="260" y="88" text-anchor="middle" font-family="${PRINT}" font-size="15" font-weight="700" fill="#333">${demoFacilityName.toUpperCase()}</text>
  <rect x="120" y="74" width="280" height="22" fill="#9a9a9a" opacity="0.5"/>
  <text x="260" y="124" text-anchor="middle" font-family="${PRINT}" font-size="20" font-weight="700" fill="#1F4591">OFFICIAL RECEIPT</text>
  <text x="40" y="170" font-family="${PRINT}" font-size="13" fill="#444">No.</text>
  <text x="76" y="170" font-family="${PRINT}" font-size="15" font-weight="700" fill="#b0222a">0004521</text>
  <text x="300" y="170" font-family="${PRINT}" font-size="13" fill="#444">Date</text>
  <text x="344" y="170" font-family="${HAND}" font-size="17" fill="${INK}">${handwritten(d.d0)}</text>
  <text x="40" y="216" font-family="${PRINT}" font-size="13" fill="#444">Received from</text>
  <text x="140" y="216" font-family="${HAND}" font-size="18" fill="${INK}">${demoPatient.name}</text>
  <line x1="136" y1="222" x2="480" y2="222" stroke="#999"/>
  <text x="40" y="262" font-family="${PRINT}" font-size="13" fill="#444">For</text>
  <text x="80" y="262" font-family="${HAND}" font-size="17" fill="${INK}">Anti-rabies vaccine &amp; consultation</text>
  <line x1="76" y1="268" x2="480" y2="268" stroke="#999"/>
  <text x="40" y="320" font-family="${PRINT}" font-size="13" fill="#444">Amount</text>
  <text x="110" y="322" font-family="${HAND}" font-size="24" fill="${INK}">₱1,250.00</text>
  <ellipse cx="166" cy="314" rx="14" ry="12" fill="#8a8a8a" opacity="0.55"/>
  <line x1="40" y1="600" x2="220" y2="600" stroke="#999"/>
  <text x="40" y="620" font-family="${PRINT}" font-size="11" fill="#666">Cashier</text>
</svg>`
}

export function sampleSvg(type: DocType) {
  if (type === 'instruction_sheet') return instructionSheet()
  if (type === 'receipt') return receipt()
  return treatmentCard()
}

export const sampleFileNames: Record<DocType, string> = {
  treatment_card: 'sample-treatment-card.svg',
  instruction_sheet: 'sample-instruction-sheet.svg',
  receipt: 'sample-receipt.svg',
}

/** Builds a fictional sample document as a File, so it flows through the same upload path. */
export function sampleFile(type: DocType) {
  return new File([sampleSvg(type)], sampleFileNames[type], { type: 'image/svg+xml' })
}

export function isSampleFile(file: File) {
  return Object.values(sampleFileNames).includes(file.name) && file.type === 'image/svg+xml'
}
