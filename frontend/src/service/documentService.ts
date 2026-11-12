import type { DocType, ExtractionResult } from '@/types/index'
import { demoExtraction } from '@/mocks/extractionFixtures'
import { wait } from '@/service/mockConfig'

export type DemoOutcome = 'auto' | 'ready' | 'partial' | 'failed'

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/svg+xml', 'application/pdf']
export const MAX_FILE_BYTES = 10 * 1024 * 1024

export class DocumentReadError extends Error {
  constructor(message = "We couldn't read this document.") {
    super(message)
    this.name = 'DocumentReadError'
  }
}

export function validateFile(file: File): string | null {
  const isImage = file.type.startsWith('image/')
  if (!isImage && file.type !== 'application/pdf') return 'Choose an image (JPG, PNG, HEIC) or a PDF file.'
  if (file.size > MAX_FILE_BYTES) return 'This file is larger than 10 MB. Try a smaller photo or PDF.'
  return null
}

/** Simulated upload with progress. Replace with a multipart POST to the backend. */
export async function uploadDocument(file: File, onProgress: (pct: number) => void): Promise<{ uploadId: string }> {
  const steps = 8
  for (let i = 1; i <= steps; i++) {
    await wait(120)
    onProgress(Math.round((i / steps) * 100))
  }
  return { uploadId: `upl_${file.name}_${Date.now()}` }
}

/**
 * DEMO EXTRACTION. Returns fictional sample values for the chosen document type,
 * regardless of the uploaded file's contents. Replace with the Lumen extraction API.
 */
export async function readDocument(_uploadId: string, type: DocType, outcome: DemoOutcome): Promise<ExtractionResult> {
  await wait(1600)
  if (outcome === 'failed') throw new DocumentReadError()
  const result = demoExtraction(type, outcome === 'partial' ? 'partial' : 'auto')
  if (outcome === 'ready' && result.outcome === 'partial') {
    // Treat the receipt as fully read for the "ready" simulation.
    result.outcome = 'ready'
    result.facility.name = { value: 'Lungsod Animal Bite Treatment Center', raw: 'LUNGSOD ANIMAL BITE TREATMENT CENTER', status: 'read' }
  }
  return result
}

/** Converts small images to data URLs so previews survive a reload in this prototype. */
export function fileToPreviewDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/') || file.size > 1.5 * 1024 * 1024) return Promise.resolve(null)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

/** Session-only previews (e.g. PDFs and large images) keyed by document id. */
const sessionPreviews = new Map<string, string>()
export const previewCache = {
  set: (docId: string, url: string) => sessionPreviews.set(docId, url),
  get: (docId: string) => sessionPreviews.get(docId) ?? null,
}
