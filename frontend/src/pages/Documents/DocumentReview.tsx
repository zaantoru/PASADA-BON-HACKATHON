import { ArrowRight, CalendarCheck, CircleCheck, FilePlus2, FileText, LoaderCircle, RotateCcw, Stethoscope, Wallet } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DetailsPanel, PanelOriginal } from '@/components/documents/DetailsPanel'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { CardReadIllustration } from '@/components/common/Illustrations'
import { Screen } from '@/components/layout/Screen'
import { Card, DemoBadge, Notice } from '@/components/common/ui'
import { docTypeLabels, formatAmount, formatDate } from '@/utils/format'
import { navigate } from '@/utils/router'
import type { ExtractionResult } from '@/types/index'
import { useMediaQuery } from '@/utils/useMediaQuery'
import { isSampleFile } from '@/mocks/sampleDocuments'
import { IncidentLinkPicker } from '@/features/documents/review/IncidentLinkPicker'
import {
  buildReviewOutput,
  criticalOutstanding,
  focusField,
  incidentFromReview,
  initState,
  outstanding,
  reviewErrors,
  trackerEntries,
  useReviewState,
  val,
} from '@/features/documents/review/model'
import { ReviewSections } from '@/features/documents/review/ReviewFields'
import { fileToPreviewDataUrl, previewCache } from '@/service/documentService'
import { guideProgress } from '@/service/guideProgress'
import { useRecords } from '@/utils/useRecords'
import { useToast } from '@/utils/useToast'

/**
 * Step after OCR: a compact summary with the extraction form in a secondary panel.
 * Confirming saves the reviewed record, which becomes the only source for the AI guide.
 */
export function DocumentReview({
  file,
  fileUrl,
  result,
  contextIncidentId,
  contextVisitId,
  backTo,
  onBackToUpload,
}: {
  file: File
  fileUrl: string | null
  result: ExtractionResult
  contextIncidentId: string | null
  contextVisitId: string | null
  backTo: string
  onBackToUpload: () => void
}) {
  const { incidents, saveReviewedDocument } = useRecords()
  const toast = useToast()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const api = useReviewState(() => initState(result))
  const { s } = api
  const todo = useMemo(() => outstanding(s), [s])
  // Open the review panel automatically when critical details are uncertain.
  const [panelOpen, setPanelOpen] = useState(() => criticalOutstanding(initState(result)).length > 0 || window.matchMedia('(min-width: 1024px)').matches)
  const [expanded, setExpanded] = useState(false)
  const [target, setTarget] = useState<string | null>(contextIncidentId ?? (incidents.length === 0 ? 'new' : null))
  const [confirmNew, setConfirmNew] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const reviewButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (panelOpen && todo.length) setTimeout(() => focusField(todo[0].id), 350)
    // Only on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const errors = reviewErrors(s)
  if (!target) errors.push({ id: 'rv-link', message: 'Choose an incident, or create a new one.' })
  if (target === 'new' && !confirmNew) errors.push({ id: 'rv-confirm-new', message: 'Confirm the new incident details.' })
  const { visits: trackerVisits, followUps: trackerFollowUps } = trackerEntries(s)
  const preview = incidentFromReview(s)

  const openReview = (focusId?: string) => {
    setPanelOpen(true)
    setTimeout(() => focusId && focusField(focusId), 300)
  }

  const goToError = (id: string) => {
    if (id.startsWith('rv-link') || id.startsWith('rv-confirm')) focusField(id)
    else openReview(id)
  }

  const confirm = async () => {
    setAttempted(true)
    if (errors.length) {
      goToError(errors[0].id)
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const out = buildReviewOutput(s)
      const previewUrl = await fileToPreviewDataUrl(file)
      const res = await saveReviewedDocument({
        target: target === 'new' ? { kind: 'new', incident: { ...preview, notes: null, source: 'document' } } : { kind: 'existing', incidentId: target! },
        visitId: contextVisitId,
        document: { type: out.documentType, fileName: file.name, mimeType: file.type, previewUrl, reviewed: out.reviewed },
        visitEntries: out.visitEntries,
        followUps: out.followUps,
        payment: out.payment,
      })
      if (fileUrl) previewCache.set(res.documentId, fileUrl)
      guideProgress.init(res.documentId)
      toast('Details confirmed and saved to your records.')
      navigate(`documents/${res.documentId}`, { replace: true })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  const original = (
    <PanelOriginal>
      <DocumentPreview url={fileUrl} mimeType={file.type} fileName={file.name} className="max-h-[60dvh]" />
      <div className="mt-2 flex items-center justify-between gap-2 px-2">
        <p className="truncate text-xs text-ink/70">{file.name}</p>
        <button type="button" onClick={onBackToUpload} className="btn btn-ghost btn-sm min-h-10 rounded-full text-royal">
          <RotateCcw className="size-4" aria-hidden /> Re-upload
        </button>
      </div>
    </PanelOriginal>
  )

  const panel = (
    <DetailsPanel
      open={panelOpen}
      onClose={() => {
        setPanelOpen(false)
        reviewButton.current?.focus()
      }}
      expanded={expanded}
      onToggleExpand={() => setExpanded((e) => !e)}
      title="Review document details"
      subtitle={todo.length ? `${todo.length} need${todo.length === 1 ? 's' : ''} your attention` : 'All flagged details checked'}
      closeLabel="Close review panel"
      footer={
        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm" aria-live="polite">
            {todo.length ? (
              <button type="button" onClick={() => focusField(todo[0].id)} className="min-h-10 font-semibold text-caution-ink underline">
                {todo.length} to check · Go to next
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                <CircleCheck className="size-4 text-royal" aria-hidden /> Ready to confirm
              </span>
            )}
          </p>
          {!isDesktop && (
            <button type="button" onClick={() => setPanelOpen(false)} className="btn btn-primary min-h-12 rounded-full px-6">
              Done reviewing
            </button>
          )}
        </div>
      }
    >
      <div className={expanded ? 'grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start' : 'flex flex-col gap-4'}>
        <div className={expanded ? 'xl:sticky xl:top-0' : ''}>{original}</div>
        <ReviewSections api={api} />
      </div>
    </DetailsPanel>
  )

  return (
    <div className="lg:flex">
      <div className="min-w-0 flex-1">
        <Screen
          title="Review your card"
          subtitle={docTypeLabels[s.documentType]}
          back={backTo}
          backLabel="Cancel review"
          footer={
            <button type="button" onClick={confirm} disabled={saving} className="btn btn-primary min-h-12 w-full rounded-full text-base">
              {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ArrowRight className="size-5" aria-hidden />}
              {saving ? 'Saving…' : 'Confirm details and continue'}
            </button>
          }
        >
          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <CardReadIllustration className="w-24 shrink-0 sm:w-28" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-royal">
                    {result.outcome === 'partial' ? 'Partially read' : 'Ready for review'}
                  </p>
                  <h2 className="mt-1 text-lg font-bold leading-snug text-navy">
                    Your card has been read. Check the important details before we explain it.
                  </h2>
                </div>
              </div>
              {result.outcome === 'partial' && (
                <p className="mt-3 text-sm text-ink/80">Some parts couldn't be read. Fill them in from the original, or leave them as Not recorded.</p>
              )}
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink/70">
                <DemoBadge>Demo Lumen OCR</DemoBadge>
                {isSampleFile(file) ? 'Values come from the fictional sample document.' : 'Simulated: sample values, not read from your file. Correct them to match your document.'}
              </p>
            </Card>

            <Card className={`p-5 ${todo.length ? 'ring-2 ring-caution-ink/20' : ''}`}>
              <div className="flex items-start gap-4">
                <span
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold ${todo.length ? 'bg-caution text-caution-ink' : 'bg-pale text-royal'}`}
                  aria-hidden
                >
                  {todo.length ? todo.length : <CircleCheck className="size-7" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">
                    {todo.length ? `${todo.length} detail${todo.length > 1 ? 's' : ''} need${todo.length === 1 ? 's' : ''} your attention` : 'All flagged details checked'}
                  </p>
                  {todo.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {todo.slice(0, 4).map((t) => (
                        <li key={t.id}>
                          <button type="button" onClick={() => openReview(t.id)} className="min-h-9 rounded-full bg-caution px-3 text-xs font-semibold text-caution-ink hover:underline">
                            {t.label}
                          </button>
                        </li>
                      ))}
                      {todo.length > 4 && <li className="self-center text-xs text-ink/70">+{todo.length - 4} more</li>}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-ink/70">You can still look over everything before confirming.</p>
                  )}
                </div>
              </div>
              <button
                ref={reviewButton}
                type="button"
                onClick={() => openReview(todo[0]?.id)}
                aria-expanded={panelOpen}
                className={`btn mt-4 min-h-12 w-full rounded-full ${todo.length ? 'btn-primary' : 'border-mist bg-white text-navy'}`}
              >
                <FileText className="size-5" aria-hidden />
                {panelOpen && isDesktop ? 'Go to the next detail' : 'Review details'}
              </button>
            </Card>

            <IncidentLinkPicker target={target} onTarget={setTarget} confirmNew={confirmNew} onConfirmNew={setConfirmNew} preview={preview} attempted={attempted} />

            <Card className="p-5">
              <p className="text-sm font-bold text-ink">What will be saved</p>
              <ul className="mt-2 grid gap-2 text-sm text-ink/80">
                <li className="flex items-center gap-2">
                  <Stethoscope className="size-4 shrink-0 text-royal" aria-hidden />
                  {trackerVisits.length
                    ? `${trackerVisits.length} recorded visit${trackerVisits.length > 1 ? 's' : ''} (${trackerVisits.map((e) => e.rowLabel.value || formatDate(val(e.dateWritten))).join(', ')})`
                    : 'No visits added to the tracker'}
                </li>
                <li className="flex items-center gap-2">
                  <CalendarCheck className="size-4 shrink-0 text-royal" aria-hidden />
                  {trackerFollowUps.length
                    ? `${trackerFollowUps.length} clinic-written appointment${trackerFollowUps.length > 1 ? 's' : ''}, marked User-confirmed`
                    : 'No appointments confirmed'}
                </li>
                {s.payment && val(s.payment.amount) && (
                  <li className="flex items-center gap-2">
                    <Wallet className="size-4 shrink-0 text-royal" aria-hidden /> Payment {formatAmount(val(s.payment.amount))}
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <FilePlus2 className="size-4 shrink-0 text-royal" aria-hidden /> The document and your reviewed details
                </li>
              </ul>
            </Card>

            {attempted && errors.length > 0 && (
              <Notice tone="error" title="Before continuing">
                <ul className="list-disc pl-4">
                  {errors.map((e) => (
                    <li key={e.message}>
                      <button type="button" className="text-left underline" onClick={() => goToError(e.id)}>
                        {e.message}
                      </button>
                    </li>
                  ))}
                </ul>
              </Notice>
            )}
            {saveError && (
              <Notice tone="error" title="Couldn't save">
                {saveError} Your review is still here — try again.
              </Notice>
            )}
          </div>
        </Screen>
      </div>
      {panel}
    </div>
  )
}
