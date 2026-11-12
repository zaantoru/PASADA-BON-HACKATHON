import { Camera, CircleAlert, ClipboardList, IdCard, Receipt, FileUp, FlaskConical, Info, LoaderCircle, PencilLine, RefreshCw, ScanText, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { selectClass } from '@/components/common/form'
import { Screen } from '@/components/layout/Screen'
import { Card, DemoBadge, FieldError, Notice } from '@/components/common/ui'
import { docTypeLabels, formatBytes, formatDate } from '@/utils/format'
import { href, navigate } from '@/utils/router'
import type { DocType, ExtractionResult } from '@/types/index'
import { sampleFile } from '@/mocks/sampleDocuments'
import { readDocument, uploadDocument, validateFile, type DemoOutcome } from '@/service/documentService'
import { useRecords } from '@/utils/useRecords'
import { DocumentReview } from '@/pages/Documents/DocumentReview'

type Phase = 'select' | 'uploading' | 'reading' | 'failed' | 'review'

const docTypes: { value: DocType; label: string; description: string; icon: typeof Receipt }[] = [
  { value: 'treatment_card', label: 'Vaccination/treatment card', description: 'Card with exposure details and dated rows', icon: IdCard },
  { value: 'instruction_sheet', label: 'Hospital instruction sheet', description: 'Instructions or a return date from the clinic', icon: ClipboardList },
  { value: 'receipt', label: 'Receipt', description: 'Official receipt for a visit', icon: Receipt },
]

const isDocType = (v: string | null): v is DocType => !!v && v in docTypeLabels

export function DocumentScan({
  incidentId,
  visitId,
  initialType,
}: {
  incidentId: string | null
  visitId: string | null
  initialType: string | null
}) {
  const { incidents, visits } = useRecords()
  const contextIncident = incidentId ? incidents.find((i) => i.id === incidentId) : undefined
  const contextVisit = visitId ? visits.find((v) => v.id === visitId) : undefined

  const [docType, setDocType] = useState<DocType>(isDocType(initialType) ? initialType : 'treatment_card')
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('select')
  const [progress, setProgress] = useState(0)
  const [outcome, setOutcome] = useState<DemoOutcome>('auto')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const pickRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase === 'uploading' || phase === 'reading' || phase === 'failed') statusRef.current?.focus()
  }, [phase])

  const backTo = contextVisit
    ? `incidents/${contextVisit.incidentId}/visits/${contextVisit.id}/edit`
    : contextIncident
      ? `incidents/${contextIncident.id}`
      : ''

  const chooseFile = (f: File | undefined | null) => {
    if (!f) return
    const err = validateFile(f)
    if (err) {
      setFileError(err)
      return
    }
    setFileError(null)
    setPhase('select')
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
  }

  const removeFile = () => {
    setFile(null)
    setFileUrl(null)
    setPhase('select')
  }

  const run = async () => {
    if (!file) {
      setFileError('Choose a photo or PDF of your document first.')
      return
    }
    setProgress(0)
    setPhase('uploading')
    try {
      const { uploadId } = await uploadDocument(file, setProgress)
      setPhase('reading')
      const r = await readDocument(uploadId, docType, outcome)
      setResult(r)
      setPhase('review')
    } catch {
      // The simulated failure happens once so "Try again" can succeed.
      if (outcome === 'failed') setOutcome('auto')
      setPhase('failed')
    }
  }

  if (phase === 'review' && result && file) {
    return (
      <DocumentReview
        file={file}
        fileUrl={fileUrl}
        result={result}
        contextIncidentId={contextIncident?.id ?? null}
        contextVisitId={contextVisit?.id ?? null}
        backTo={backTo}
        onBackToUpload={() => setPhase('select')}
      />
    )
  }

  const busy = phase === 'uploading' || phase === 'reading'

  return (
    <Screen
      title="Scan document"
      subtitle="Upload a clear photo or PDF. We'll read it, then you review the details."
      back={backTo}
      backLabel="Cancel"
      footer={
        phase === 'failed' ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => pickRef.current?.click()} className="btn min-h-12 flex-1 rounded-full border-mist bg-white text-navy">
              Choose another file
            </button>
            <button type="button" onClick={run} className="btn btn-primary min-h-12 flex-1 rounded-full">
              <RefreshCw className="size-4" aria-hidden /> Try again
            </button>
          </div>
        ) : (
          <button type="button" onClick={run} disabled={busy} className="btn btn-primary min-h-12 w-full rounded-full text-base">
            {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ScanText className="size-5" aria-hidden />}
            {phase === 'uploading' ? 'Uploading…' : phase === 'reading' ? 'Reading document…' : 'Read document'}
          </button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {(contextIncident || contextVisit) && (
          <Notice title={contextVisit ? 'Attaching to a hospital visit' : 'Adding to an incident'}>
            {contextVisit
              ? `Visit on ${formatDate(contextVisit.date)} · ${contextVisit.facilityName ?? 'Facility not recorded'}`
              : `Incident on ${formatDate(contextIncident!.exposureDate)} · ${contextIncident!.location ?? 'Location not recorded'}`}
          </Notice>
        )}

        <Card className="p-5">
          <fieldset disabled={busy}>
            <legend className="mb-3 text-sm font-bold text-ink">Document type</legend>
            <div className="grid gap-2">
              {docTypes.map((t) => (
                <label key={t.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="docType"
                    value={t.value}
                    checked={docType === t.value}
                    onChange={() => setDocType(t.value)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-mist bg-white p-3 transition peer-checked:border-royal peer-checked:bg-pale peer-checked:ring-1 peer-checked:ring-royal peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-royal">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pale text-royal">
                      <t.icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-ink">{t.label}</span>
                      <span className="block text-xs text-ink/70">{t.description}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card className="p-5">
          <p className="mb-3 text-sm font-bold text-ink">File</p>
          <input ref={pickRef} type="file" accept="image/*,application/pdf" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (chooseFile(e.target.files?.[0]), (e.target.value = ''))} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => (chooseFile(e.target.files?.[0]), (e.target.value = ''))} />

          {!file ? (
            <div
              onDragOver={(e) => (e.preventDefault(), setDragging(true))}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                chooseFile(e.dataTransfer.files?.[0])
              }}
              className={`rounded-2xl border-2 border-dashed p-5 text-center transition ${dragging ? 'border-royal bg-pale' : 'border-mist bg-canvas'}`}
            >
              <FileUp className="mx-auto size-8 text-royal" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-ink">Add a photo or PDF</p>
              <p className="text-xs text-ink/70">JPG, PNG, HEIC, or PDF up to 10 MB. Lay the document flat in good light.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => cameraRef.current?.click()} className="btn btn-primary min-h-12 rounded-full">
                  <Camera className="size-5" aria-hidden /> Take photo
                </button>
                <button type="button" onClick={() => pickRef.current?.click()} className="btn min-h-12 rounded-full border-mist bg-white text-navy">
                  <FileUp className="size-5" aria-hidden /> Upload file
                </button>
              </div>
              <div className="mt-4 border-t border-mist pt-4">
                <button
                  type="button"
                  onClick={() => chooseFile(sampleFile(docType))}
                  className="btn btn-ghost min-h-11 rounded-full text-royal"
                >
                  <FlaskConical className="size-4" aria-hidden />
                  Use fictional sample {docType === 'treatment_card' ? 'treatment card' : docType === 'receipt' ? 'receipt' : 'instruction sheet'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <DocumentPreview url={fileUrl} mimeType={file.type} fileName={file.name} className="max-h-[46dvh]" />
              <div className="mt-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
                  <p className="text-xs text-ink/70">{formatBytes(file.size)}</p>
                </div>
                <button type="button" disabled={busy} onClick={() => pickRef.current?.click()} className="btn btn-sm min-h-11 rounded-full border-mist bg-white text-navy">
                  Change
                </button>
                <button type="button" disabled={busy} onClick={removeFile} className="btn btn-sm btn-ghost min-h-11 rounded-full text-ink/70" aria-label="Remove file">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
          <FieldError id="file-error">{fileError}</FieldError>
        </Card>

        <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
          {phase === 'uploading' && (
            <Card className="p-5">
              <p className="text-sm font-bold text-navy">Uploading…</p>
              <progress className="progress progress-primary mt-3 h-2.5 w-full" value={progress} max={100} aria-label="Upload progress" />
              <p className="mt-1.5 text-xs text-ink/70">{progress}% · Keep this screen open.</p>
            </Card>
          )}
          {phase === 'reading' && (
            <Card className="flex items-center gap-4 p-5">
              <span className="loading loading-spinner loading-md text-royal" aria-hidden />
              <div>
                <p className="text-sm font-bold text-navy">Reading document…</p>
                <p className="text-xs text-ink/70">Finding names, dates, and the rows written by the clinic.</p>
              </div>
            </Card>
          )}
          {phase === 'failed' && (
            <Notice tone="error" icon={CircleAlert} title="Couldn't read document">
              <p>The photo may be blurry, too dark, or cut off. Your file is still selected — try again, or choose a clearer photo.</p>
              <a href={href(contextIncident ? `incidents/${contextIncident.id}/visits/new` : 'incidents/new')} className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-red-900 underline">
                <PencilLine className="size-4" aria-hidden />
                {contextIncident ? 'Enter visit details manually instead' : 'Record the incident manually instead'}
              </a>
            </Notice>
          )}
        </div>

        <details className="group rounded-2xl border border-dashed border-navy/30 bg-white p-4">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-navy">
            <span className="flex items-center gap-2">
              <DemoBadge>Prototype</DemoBadge> Demo extraction settings
            </span>
            <span className="text-xs text-ink/70 group-open:hidden">Show</span>
            <span className="hidden text-xs text-ink/70 group-open:inline">Hide</span>
          </summary>
          <div className="mt-3">
            <p className="mb-3 flex gap-2 text-xs leading-relaxed text-ink/70">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Document reading is simulated. Any file returns fictional sample values for the selected document type.
            </p>
            <label htmlFor="demo-outcome" className="mb-1.5 block text-sm font-bold text-ink">
              Simulated result
            </label>
            <select id="demo-outcome" className={selectClass} value={outcome} onChange={(e) => setOutcome(e.target.value as DemoOutcome)} disabled={busy}>
              <option value="auto">Automatic (based on document type)</option>
              <option value="ready">Ready for review</option>
              <option value="partial">Partially read</option>
              <option value="failed">Couldn't read document (once)</option>
            </select>
          </div>
        </details>

        {!contextIncident && (
          <button type="button" onClick={() => navigate('incidents/new')} className="mx-auto flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-royal hover:underline">
            <PencilLine className="size-4" aria-hidden /> Record incident manually instead
          </button>
        )}
      </div>
    </Screen>
  )
}
