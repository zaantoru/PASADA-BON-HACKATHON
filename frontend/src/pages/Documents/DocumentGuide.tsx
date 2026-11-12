import { pickAppointment } from '@/utils/appointments'
import {
  BookOpen,
  Compass,
  ExternalLink,
  FileText,
  HeartHandshake,
  LoaderCircle,
  MapPin,
  PencilLine,
  Phone,
  Play,
  RefreshCw,
  RotateCcw,
  Share2,
  Star,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DetailsPanel, PanelOriginal } from '@/components/documents/DetailsPanel'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { GuideAvatar } from '@/components/common/Illustrations'
import { Screen } from '@/components/layout/Screen'
import { Card, DemoBadge, Notice, Segmented, UserConfirmedBadge } from '@/components/common/ui'
import { AppointmentCard } from '@/features/documents/guide/AppointmentCard'
import { CommunitySheet } from '@/features/documents/guide/CommunitySheet'
import { EDU } from '@/features/documents/guide/education'
import { GuideSectionCard, KindLabel } from '@/features/documents/guide/GuideBlocks'
import { ReminderSheet } from '@/features/documents/guide/ReminderSheet'
import { CONTENT_STATUS, SOURCES } from '@/features/documents/guide/sources'
import { STRINGS } from '@/features/documents/guide/strings'
import { Tour } from '@/features/documents/guide/Tour'
import type { GuideAction, GuideContent, Lang, SectionKey } from '@/features/documents/guide/types'
import { docTypeLabels, formatDate } from '@/utils/format'
import { navigate } from '@/utils/router'
import type { StoredDocument } from '@/types/index'
import { useMediaQuery } from '@/utils/useMediaQuery'
import { buildReviewOutput, focusField, incidentFromReview, reviewErrors, stateFromStored, useReviewState } from '@/features/documents/review/model'
import { ReviewSections } from '@/features/documents/review/ReviewFields'
import { panelSectionId, type PanelSection } from '@/features/documents/review/panel'
import { previewCache } from '@/service/documentService'
import { buildGuideInput, generateGuide, hashGuideInput } from '@/service/guideService'
import { useGuideProgress } from '@/service/guideProgress'
import { prototypeFlags } from '@/service/prototypeFlags'
import { useRecords } from '@/utils/useRecords'
import { useToast } from '@/utils/useToast'
import { DocumentDetailsContent } from '@/pages/Documents/DocumentDetail'
import { NotFound } from '@/pages/NotFound'

const ORDER: SectionKey[] = ['card', 'category', 'followUp', 'watch', 'costs']
const secId = (k: SectionKey) => `guide-sec-${k}`

/** Post-review assistant for a saved document. Everything personal comes from the reviewed record. */
export function DocumentGuide({ documentId }: { documentId: string }) {
  const { documents } = useRecords()
  const doc = documents.find((d) => d.id === documentId)
  if (!doc) return <NotFound title="Document not found" />
  return <Guide doc={doc} />
}

type PanelState = { mode: 'view' | 'edit'; section?: PanelSection } | null

function Guide({ doc }: { doc: StoredDocument }) {
  const { followUps: allFollowUps, incidents } = useRecords()
  const toast = useToast()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [progress, update] = useGuideProgress(doc.id)
  const lang = progress.lang
  const t = STRINGS[lang]

  const followUps = useMemo(() => allFollowUps.filter((f) => f.documentId === doc.id), [allFollowUps, doc.id])
  const incident = incidents.find((i) => i.id === doc.incidentId) ?? null
  const input = useMemo(() => buildGuideInput(doc, followUps), [doc, followUps])
  const hash = useMemo(() => hashGuideInput(input), [input])
  const content = progress.content[lang] ?? null
  const stale = !!content && content.inputHash !== hash
  const appt = pickAppointment(followUps)
  const previewUrl = doc.previewUrl ?? previewCache.get(doc.id)

  // Generation
  const [gen, setGen] = useState<'idle' | 'generating' | 'failed'>('idle')
  const inFlight = useRef<string | null>(null)
  const refreshAfterEdit = useRef(false)
  const generating = gen === 'generating' || (!content && gen === 'idle')
  const generate = useCallback(() => {
    const key = `${hash}:${lang}`
    if (inFlight.current === key) return
    inFlight.current = key
    return generateGuide(input, lang).then((c) => {
      // Keep other languages only if they were built from the same reviewed data.
      update((p) => ({
        content: { ...Object.fromEntries(Object.entries(p.content).filter(([, v]) => v?.inputHash === c.inputHash)), [lang]: c },
      }))
      setGen('idle')
    }).catch(() => {
      setGen('failed')
    }).finally(() => {
      inFlight.current = null
    })
  }, [hash, input, lang, update])

  useEffect(() => {
    if (!content && gen === 'idle') generate()
  }, [content, gen, generate])
  useEffect(() => {
    if (stale && refreshAfterEdit.current && gen === 'idle') {
      refreshAfterEdit.current = false
      generate()
    }
  }, [stale, gen, generate])

  const setLang = (l: Lang) => {
    setGen('idle')
    update({ lang: l })
  }

  // Panel
  const [panel, setPanel] = useState<PanelState>(null)
  const [expanded, setExpanded] = useState(false)
  const detailsButton = useRef<HTMLButtonElement>(null)
  const openPanel = (mode: 'view' | 'edit', section?: PanelSection) => {
    setTourOpen(false)
    setPanel({ mode, section })
    if (mode === 'edit') setExpanded(true)
  }
  const closePanel = useCallback(() => {
    setPanel(null)
    setExpanded(false)
    detailsButton.current?.focus()
  }, [])
  useEffect(() => {
    if (!panel?.section) return
    const id = setTimeout(() => document.getElementById(panelSectionId(panel.section!))?.scrollIntoView({ block: 'start' }), 120)
    return () => clearTimeout(id)
  }, [panel])

  // Tour
  const [tourOpen, setTourOpen] = useState(false)
  const steps = (content?.tour ?? []).map((s) => ({ targetId: secId(s.target), title: s.title, body: s.body }))
  const startTour = (from = 0) => {
    if (!isDesktop) setPanel(null)
    update({ tour: { status: 'in_progress', step: from } })
    setTourOpen(true)
  }
  const tourStep = Math.min(progress.tour.step, Math.max(steps.length - 1, 0))

  // Sheets
  const [reminderOpen, setReminderOpen] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)

  const goCare = (path: string) => {
    update({ assistance: 'accepted' })
    navigate(`hospitals?from=${doc.id}&${path}`)
  }
  const runAction = (a: GuideAction) => {
    switch (a.type) {
      case 'show_public_centers':
        return goCare(`tab=facilities&ownership=public${a.placeId ? `&near=${a.placeId}` : ''}`)
      case 'view_assistance':
        return goCare('tab=assistance')
      case 'open_facility':
        return goCare(`tab=facilities&focus=${a.facilityId}`)
      case 'set_reminder':
        return appt && setReminderOpen(true)
      case 'open_document_details':
        return openPanel('view', a.panelSection)
      case 'call_facility':
        return
    }
  }
  const actionsFor = (k: SectionKey) => (content?.actions ?? []).filter((a) => a.section === k)

  const place = doc.reviewed.incident.place.value ?? incident?.location ?? null
  const animal = doc.reviewed.incident.animalType.value ?? (incident && incident.animalType !== 'unknown' ? incident.animalType : null)

  const original = (
    <PanelOriginal id={panelSectionId('original')}>
      <DocumentPreview url={previewUrl} mimeType={doc.mimeType} fileName={doc.fileName} className="max-h-[60dvh]" />
      <p className="mt-2 truncate px-2 text-xs text-ink/70">{doc.fileName}</p>
    </PanelOriginal>
  )

  const panelEl =
    panel?.mode === 'edit' ? (
      <EditPanel
        key={doc.savedAt}
        doc={doc}
        original={original}
        expanded={expanded}
        onToggleExpand={() => setExpanded((e) => !e)}
        onCancel={() => setPanel({ mode: 'view', section: panel.section })}
        onClose={closePanel}
        onSaved={() => {
          refreshAfterEdit.current = true
          toast('Details updated. Your guide is being refreshed.')
          // Stay closed if the user closed the panel while saving.
          setPanel((p) => (p ? { mode: 'view', section: p.section } : null))
        }}
      />
    ) : (
      <DetailsPanel
        open={!!panel}
        onClose={closePanel}
        expanded={expanded}
        onToggleExpand={() => setExpanded((e) => !e)}
        title="Document details"
        subtitle={`Reviewed and saved ${formatDate(doc.savedAt.slice(0, 10))}`}
        footer={
          <button type="button" onClick={() => openPanel('edit', panel?.section)} className="btn btn-primary min-h-12 w-full rounded-full">
            <PencilLine className="size-4" aria-hidden /> Edit details
          </button>
        }
      >
        <div className={expanded ? 'grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start' : 'flex flex-col gap-4'}>
          <div className={expanded ? 'xl:sticky xl:top-0' : ''}>{original}</div>
          <div className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-2 px-1 text-xs text-ink/70">
              <UserConfirmedBadge /> Values you reviewed. “On document” shows the original wording where it differs.
            </p>
            <DocumentDetailsContent doc={doc} />
          </div>
        </div>
      </DetailsPanel>
    )

  const ready = !!content
  const sections = content?.sections

  return (
    <div className="lg:flex lg:items-start">
      <div className="min-w-0 flex-1">
        <Screen
          title={docTypeLabels[doc.type]}
          eyebrow={t.guideName}
          back={`incidents/${doc.incidentId}`}
          backLabel="Back to incident"
          actions={
            <button
              ref={detailsButton}
              type="button"
              onClick={() => (panel ? closePanel() : openPanel('view'))}
              aria-expanded={!!panel}
              className="btn min-h-11 shrink-0 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-white/40 bg-white/10 px-3 text-white hover:bg-white/20"
            >
              <FileText className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t.viewDetails}</span>
              <span className="sm:hidden">{t.details}</span>
            </button>
          }
        >
          <div lang={lang === 'fil' ? 'fil' : 'en'} className="flex flex-col gap-5">
            {/* Intro */}
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <GuideAvatar className="size-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold leading-snug text-navy">
                    {content?.greeting ??
                      (lang === 'fil'
                        ? 'Kumusta! Nasuri ko na ang mga detalyeng kinumpirma mo. Unawain natin ang iyong card at ang mga susunod na hakbang.'
                        : 'Hi! I’ve reviewed the details you confirmed. Let’s understand your card and your next steps.')}
                  </p>
                  {content && <p className="mt-1 text-sm text-ink/75">{content.overview}</p>}
                </div>
              </div>
              <div className="mt-4 max-w-xs">
                <Segmented
                  label={t.language}
                  value={lang}
                  onChange={setLang}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'fil', label: 'Filipino' },
                  ]}
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={!ready} onClick={() => startTour(progress.tour.status === 'in_progress' ? tourStep : 0)} className="btn btn-primary min-h-12 flex-nowrap gap-1.5 rounded-full px-4">
                  {progress.tour.status === 'completed' || progress.tour.status === 'skipped' ? <RotateCcw className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                  <span className="truncate">
                    {progress.tour.status === 'in_progress'
                      ? t.continueTour(tourStep + 1, steps.length || 5)
                      : progress.tour.status === 'not_started'
                        ? t.walkThrough
                        : t.replayTour}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => {
                    update({ overviewSeen: true })
                    document.getElementById(secId('card'))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="btn min-h-12 rounded-full border-mist bg-white text-navy"
                >
                  <BookOpen className="size-4" aria-hidden /> {t.readOverview}
                </button>
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-ink/70">
                <DemoBadge>{t.demoGuide}</DemoBadge>
                {t.demoGuideNote}
              </p>
            </Card>

            {/* States */}
            <div aria-live="polite" className="contents">
              {generating && (
                <Card className="flex items-center gap-3 p-5">
                  <LoaderCircle className="size-6 shrink-0 animate-spin text-royal" aria-hidden />
                  <div>
                    <p className="font-bold text-navy">{t.preparing}</p>
                    <p className="text-sm text-ink/70">{t.preparingNote}</p>
                  </div>
                </Card>
              )}
              {gen === 'failed' && (
                <Notice tone="error" icon={TriangleAlert} title={t.failedTitle}>
                  {t.failedBody}
                  <button type="button" onClick={() => { setGen('generating'); void generate() }} className="btn btn-sm mt-3 flex min-h-10 rounded-full">
                    <RefreshCw className="size-4" aria-hidden /> {t.retry}
                  </button>
                </Notice>
              )}
              {stale && gen !== 'generating' && (
                <Notice tone="caution" title={t.staleTitle}>
                  {t.staleBody}
                  <button type="button" onClick={() => { setGen('generating'); void generate() }} className="btn btn-sm mt-3 flex min-h-10 rounded-full border-caution-ink/30 bg-white text-caution-ink">
                    <RefreshCw className="size-4" aria-hidden /> {t.updateGuide}
                  </button>
                </Notice>
              )}
            </div>

            {!ready && generating && (
              <div className="grid gap-3" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-3xl bg-white p-5 shadow-card">
                    <div className="skeleton h-5 w-1/2 bg-pale" />
                    <div className="skeleton mt-3 h-16 w-full bg-pale" />
                  </div>
                ))}
              </div>
            )}

            {/* Failure fallback: saved data + general information stay available */}
            {!ready && gen === 'failed' && (
              <>
                <AppointmentCard
                  appt={appt}
                  lang={lang}
                  reminder={progress.reminder}
                  onViewSource={() => openPanel('view', 'visits')}
                  onEdit={() => openPanel('edit', 'visits')}
                  onReminder={() => setReminderOpen(true)}
                  onFindCare={() => goCare('tab=facilities&ownership=public')}
                />
                <Card className="grid gap-3 p-5">
                  <KindLabel kind="general" lang={lang} />
                  <p className="text-sm leading-relaxed">{EDU.washWound[lang]}</p>
                  <p className="text-sm leading-relaxed">{EDU.incubation[lang]}</p>
                  <p className="text-sm leading-relaxed">{EDU.whereToAsk[lang]}</p>
                  <a href={SOURCES['who-rabies'].url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline">
                    {t.source}: {SOURCES['who-rabies'].name} <ExternalLink className="size-3" aria-hidden />
                  </a>
                  <button type="button" onClick={() => goCare('tab=facilities&ownership=public')} className="btn btn-primary min-h-12 rounded-full">
                    <HeartHandshake className="size-4" aria-hidden /> {t.careYes}
                  </button>
                </Card>
              </>
            )}

            {ready && sections && (
              <>
                <div className="flex flex-wrap items-center gap-2" aria-label={t.legend}>
                  <span className="text-xs font-semibold text-ink/70">{t.legend}:</span>
                  <KindLabel kind="from_card" lang={lang} />
                  <KindLabel kind="general" lang={lang} />
                  <KindLabel kind="needs_confirmation" lang={lang} />
                </div>

                {ORDER.map((k, i) => (
                  <GuideSectionCard
                    key={k}
                    id={secId(k)}
                    index={i + 1}
                    section={sections[k]}
                    lang={lang}
                    top={
                      k === 'followUp' ? (
                        <AppointmentCard
                          appt={appt}
                          lang={lang}
                          reminder={progress.reminder}
                          onViewSource={() => openPanel('view', 'visits')}
                          onEdit={() => openPanel('edit', 'visits')}
                          onReminder={() => setReminderOpen(true)}
                          onFindCare={() => runAction({ type: 'show_public_centers', section: 'followUp', placeId: actionPlace(content) })}
                        />
                      ) : undefined
                    }
                  >
                    {k === 'costs' ? (
                      <CarePrompt
                        lang={lang}
                        state={progress.assistance}
                        onYes={() => runAction({ type: 'show_public_centers', section: 'costs', placeId: actionPlace(content) })}
                        onAssistance={() => runAction({ type: 'view_assistance', section: 'costs' })}
                        onNo={() => update({ assistance: 'dismissed' })}
                      />
                    ) : (
                      <ActionRow actions={actionsFor(k)} lang={lang} onRun={runAction} />
                    )}
                  </GuideSectionCard>
                ))}
              </>
            )}

            {progress.preferred && (
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
                    <Star className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-royal">{t.preferredTitle}</p>
                    <p className="mt-0.5 font-bold text-ink">{progress.preferred.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/75">{t.preferredNote}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `hospitals?from=${doc.id}&tab=${progress.preferred!.kind === 'facility' ? 'facilities' : 'assistance'}&focus=${progress.preferred!.id}`,
                      )
                    }
                    className="btn min-h-11 rounded-full border-mist bg-white px-2 text-navy"
                  >
                    {t.openOption}
                  </button>
                  <button type="button" onClick={() => goCare('tab=facilities&ownership=public')} className="btn min-h-11 rounded-full border-mist bg-white px-2 text-navy">
                    {t.changeOption}
                  </button>
                  <button type="button" onClick={() => update({ preferred: null })} className="btn btn-ghost min-h-11 rounded-full px-2 text-ink/80">
                    {t.removeOption}
                  </button>
                </div>
              </Card>
            )}

            {progress.assistance !== 'pending' && (
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pale text-royal">
                    <Share2 className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy">{t.communityTitle}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/75">
                      {progress.community === 'shared' ? t.communityShared : progress.community === 'skipped' ? t.communitySkipped : t.communityBody}
                    </p>
                  </div>
                </div>
                {progress.community !== 'shared' && (
                  <div className={`mt-4 grid gap-2 ${progress.community === 'pending' ? 'grid-cols-2' : ''}`}>
                    <button type="button" onClick={() => setCommunityOpen(true)} className="btn btn-primary min-h-11 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3">
                      <MapPin className="size-4" aria-hidden /> {progress.community === 'skipped' ? t.communityChange : t.communityShare}
                    </button>
                    {progress.community === 'pending' && (
                      <button type="button" onClick={() => update({ community: 'skipped' })} className="btn min-h-11 rounded-full border-mist bg-white text-navy">
                        {t.communitySkip}
                      </button>
                    )}
                  </div>
                )}
              </Card>
            )}

            <Card className="p-5">
              <p className="text-sm font-bold text-navy">{t.sourcesTitle}</p>
              <ul className="mt-2 grid gap-1.5 text-sm">
                {Object.values(SOURCES).map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 font-semibold text-royal hover:underline">
                      {s.name} <ExternalLink className="mt-1 size-3 shrink-0" aria-hidden />
                    </a>
                    <span className="block text-xs text-ink/70">Checked {formatDate(s.checked)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-ink/70">{CONTENT_STATUS[lang]}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">
                {lang === 'fil'
                  ? 'Ang mga detalye ng ECSGH ay para lang sa ospital na iyon, hindi para sa lahat ng pasilidad.'
                  : 'ECSGH details describe that hospital only. They don’t apply to other facilities.'}
              </p>
            </Card>

            <PrototypeSettings lang={lang} />
          </div>
        </Screen>
      </div>

      {panelEl}

      {!panel && !tourOpen && (
        <button
          type="button"
          onClick={() => openPanel('view')}
          className="btn btn-primary fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-[1050] min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-4 shadow-card lg:hidden"
        >
          <FileText className="size-4" aria-hidden /> {t.viewDetails}
        </button>
      )}

      {tourOpen && steps.length > 0 && (
        <Tour
          steps={steps}
          step={tourStep}
          lang={lang}
          onStep={(n) => update({ tour: { status: 'in_progress', step: n } })}
          onDone={() => {
            update({ tour: { status: 'completed', step: 0 }, overviewSeen: true })
            setTourOpen(false)
          }}
          onSkip={() => {
            update({ tour: { status: 'skipped', step: 0 } })
            setTourOpen(false)
          }}
        />
      )}

      {appt && (
        <ReminderSheet
          open={reminderOpen}
          onClose={() => setReminderOpen(false)}
          appointmentDate={appt.date}
          facilityName={appt.facilityName}
          existing={progress.reminder}
          onSave={(r) => update({ reminder: r })}
        />
      )}
      <CommunitySheet
        open={communityOpen}
        onClose={() => setCommunityOpen(false)}
        place={place}
        animal={animal}
        exposureDate={doc.reviewed.incident.exposureDate.value ?? incident?.exposureDate ?? null}
        onShared={() => {
          update({ community: 'shared' })
          setCommunityOpen(false)
        }}
        onSkip={() => {
          update({ community: 'skipped' })
          setCommunityOpen(false)
        }}
        onEditLocation={() => {
          setCommunityOpen(false)
          openPanel('edit', 'people')
        }}
      />
    </div>
  )
}

const actionPlace = (c: GuideContent) => {
  const a = c.actions.find((x) => x.type === 'show_public_centers')
  return a && a.type === 'show_public_centers' ? a.placeId : undefined
}

function ActionRow({ actions, lang, onRun }: { actions: GuideAction[]; lang: Lang; onRun: (a: GuideAction) => void }) {
  if (!actions.length) return null
  const cls = 'btn h-auto min-h-11 max-w-full gap-1.5 rounded-full border-mist bg-white px-4 py-2 text-left leading-snug text-navy'
  const label = (a: GuideAction): ReactNode => {
    const fil = lang === 'fil'
    switch (a.type) {
      case 'open_document_details':
        return (
          <>
            <FileText className="size-4" aria-hidden /> {fil ? 'Tingnan sa iyong card' : 'See it on your card'}
          </>
        )
      case 'open_facility':
        return (
          <>
            <MapPin className="size-4" aria-hidden /> {fil ? 'Buksan ang pasilidad' : 'Open your treatment center'}
          </>
        )
      case 'set_reminder':
        return fil ? 'Mag-set ng paalala' : 'Set reminder'
      default:
        return null
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a, i) =>
        a.type === 'call_facility' ? (
          <a key={i} href={`tel:${a.phone.replace(/[^\d+]/g, '')}`} className={cls} aria-label={`${lang === 'fil' ? 'Tawagan ang' : 'Call'} ${a.facilityName}`}>
            <Phone className="size-4 shrink-0" aria-hidden /> {lang === 'fil' ? 'Tawagan ang treatment center' : 'Call your treatment center'}
          </a>
        ) : label(a) ? (
          <button key={i} type="button" onClick={() => onRun(a)} className={cls}>
            {label(a)}
          </button>
        ) : null,
      )}
    </div>
  )
}

function CarePrompt({
  lang,
  state,
  onYes,
  onAssistance,
  onNo,
}: {
  lang: Lang
  state: 'pending' | 'accepted' | 'dismissed'
  onYes: () => void
  onAssistance: () => void
  onNo: () => void
}) {
  const t = STRINGS[lang]
  if (state !== 'pending')
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-pale p-3">
        <p className="min-w-0 flex-1 text-sm font-semibold text-navy">{t.careLater}</p>
        <button type="button" onClick={onYes} className="btn btn-sm min-h-10 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy">
          <Compass className="size-4" aria-hidden /> {lang === 'fil' ? 'Mga treatment center' : 'Treatment centers'}
        </button>
        <button type="button" onClick={onAssistance} className="btn btn-sm min-h-10 flex-nowrap gap-1.5 whitespace-nowrap rounded-full border-mist bg-white px-3 text-navy">
          <HeartHandshake className="size-4" aria-hidden /> {lang === 'fil' ? 'Tulong pinansyal' : 'Assistance offices'}
        </button>
      </div>
    )
  return (
    <div className="rounded-2xl bg-gradient-to-br from-pale to-white p-4 ring-1 ring-mist">
      <div className="flex items-start gap-3">
        <GuideAvatar className="size-10 shrink-0" />
        <p className="text-sm font-semibold leading-relaxed text-ink">{t.careQuestion}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={onYes} className="btn btn-primary min-h-12 rounded-full px-3 leading-tight">
          {t.careYes}
        </button>
        <button type="button" onClick={onNo} className="btn min-h-12 rounded-full border-mist bg-white text-navy">
          {t.careNo}
        </button>
      </div>
    </div>
  )
}

function PrototypeSettings({ lang }: { lang: Lang }) {
  const t = STRINGS[lang]
  const [flags, setFlags] = useState(prototypeFlags.get)
  const set = (patch: Parameters<typeof prototypeFlags.set>[0]) => {
    prototypeFlags.set(patch)
    setFlags(prototypeFlags.get())
  }
  return (
    <details className="rounded-3xl border border-dashed border-mist bg-white/60 p-4 text-sm">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 font-semibold text-ink/80">
        <DemoBadge>{t.prototype}</DemoBadge>
      </summary>
      <div className="mt-2 grid gap-2">
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={flags.guideFailsOnce} onChange={(e) => set({ guideFailsOnce: e.target.checked })} />
          {t.failNext}
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={flags.assistanceUnavailable} onChange={(e) => set({ assistanceUnavailable: e.target.checked })} />
          {t.assistanceDown}
        </label>
      </div>
    </details>
  )
}

/** Editing reuses the review form and the same validation and save builder as first confirmation. */
function EditPanel({
  doc,
  original,
  expanded,
  onToggleExpand,
  onCancel,
  onClose,
  onSaved,
}: {
  doc: StoredDocument
  original: ReactNode
  expanded: boolean
  onToggleExpand: () => void
  onCancel: () => void
  onClose: () => void
  onSaved: () => void
}) {
  const { updateReviewedDocument } = useRecords()
  const api = useReviewState(() => stateFromStored(doc))
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const errors = reviewErrors(api.s)

  const save = async () => {
    setAttempted(true)
    if (errors.length) return focusField(errors[0].id)
    setSaving(true)
    setSaveError(null)
    try {
      const out = buildReviewOutput(api.s)
      const inc = incidentFromReview(api.s)
      await updateReviewedDocument(doc.id, {
        visitId: null,
        document: { type: out.documentType, fileName: doc.fileName, mimeType: doc.mimeType, previewUrl: doc.previewUrl, reviewed: out.reviewed },
        visitEntries: out.visitEntries,
        followUps: out.followUps,
        payment: out.payment,
        incidentFromDocument: { exposureDate: inc.exposureDate, location: inc.location, animalType: inc.animalType, bodyAreaDetail: inc.bodyAreaDetail },
      })
      onSaved()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <DetailsPanel
      open
      onClose={onClose}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
      title="Edit document details"
      subtitle="Saving updates your records. Your guide will be refreshed to match."
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} disabled={saving} className="btn min-h-12 rounded-full border-mist bg-white text-navy">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary min-h-12 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3">
            {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />} {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      }
    >
      <div className={expanded ? 'grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start' : 'flex flex-col gap-4'}>
        <div className={expanded ? 'xl:sticky xl:top-0' : ''}>{original}</div>
        <div className="flex flex-col gap-4">
          {attempted && errors.length > 0 && (
            <Notice tone="error" title="Before saving">
              <ul className="list-disc pl-4">
                {errors.map((e) => (
                  <li key={e.message}>
                    <button type="button" className="text-left underline" onClick={() => focusField(e.id)}>
                      {e.message}
                    </button>
                  </li>
                ))}
              </ul>
            </Notice>
          )}
          {saveError && (
            <Notice tone="error" title="Couldn't save">
              {saveError} Your edits are still here — try again.
            </Notice>
          )}
          <ReviewSections api={api} />
        </div>
      </div>
    </DetailsPanel>
  )
}
