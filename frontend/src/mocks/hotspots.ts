import type { HotspotArea } from '@/types/index'

/**
 * Demo, anonymized, area-level counts of reported animal-bite incidents.
 * Centers are approximate area centroids — never home addresses.
 */
const updated = '2025-10-31'
const r = (d30: [number, number], d90: [number, number], m12: [number, number]) => ({
  '30d': { dog: d30[0], cat: d30[1] },
  '90d': { dog: d90[0], cat: d90[1] },
  '12m': { dog: m12[0], cat: m12[1] },
})

export const demoHotspots: HotspotArea[] = [
  { id: 'hs-cubao', name: 'Cubao area', city: 'Quezon City', lat: 14.6191, lng: 121.0524, reports: r([14, 6], [37, 15], [128, 51]), updated },
  { id: 'hs-commonwealth', name: 'Commonwealth area', city: 'Quezon City', lat: 14.6935, lng: 121.0886, reports: r([19, 4], [52, 13], [176, 44]), updated },
  { id: 'hs-project4', name: 'Project 4 area', city: 'Quezon City', lat: 14.6266, lng: 121.0707, reports: r([5, 3], [14, 8], [49, 27]), updated },
  { id: 'hs-tondo', name: 'Tondo area', city: 'Manila', lat: 14.6186, lng: 120.9669, reports: r([22, 7], [61, 19], [203, 66]), updated },
  { id: 'hs-sampaloc', name: 'Sampaloc area', city: 'Manila', lat: 14.6097, lng: 120.9969, reports: r([9, 5], [26, 12], [88, 40]), updated },
  { id: 'hs-malate', name: 'Malate area', city: 'Manila', lat: 14.5702, lng: 120.9897, reports: r([4, 4], [12, 9], [41, 30]), updated },
  { id: 'hs-kapitolyo', name: 'Kapitolyo area', city: 'Pasig', lat: 14.5719, lng: 121.0616, reports: r([3, 2], [9, 5], [31, 18]), updated },
  { id: 'hs-rosario', name: 'Rosario area', city: 'Pasig', lat: 14.5893, lng: 121.0913, reports: r([11, 2], [30, 7], [97, 22]), updated },
  { id: 'hs-poblacion', name: 'Poblacion area', city: 'Makati', lat: 14.5659, lng: 121.0323, reports: r([2, 3], [7, 8], [25, 26]), updated },
  { id: 'hs-concepcion', name: 'Concepcion area', city: 'Marikina', lat: 14.6514, lng: 121.1035, reports: r([8, 1], [21, 4], [70, 15]), updated },
  { id: 'hs-bagongsilang', name: 'Bagong Silang area', city: 'Caloocan', lat: 14.7746, lng: 121.0459, reports: r([17, 3], [48, 10], [159, 33]), updated },
  { id: 'hs-bicutan', name: 'Western Bicutan area', city: 'Taguig', lat: 14.5094, lng: 121.0375, reports: r([7, 2], [19, 6], [64, 20]), updated },
]
