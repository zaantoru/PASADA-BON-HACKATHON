import { BookOpen, ChevronDown, CircleHelp, ExternalLink, FileCheck2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { STRINGS } from '@/features/documents/guide/strings'
import type { BlockKind, GuideBlock, GuideSection, Lang } from '@/features/documents/guide/types'

const kindStyle: Record<BlockKind, { chip: string; box: string; icon: typeof BookOpen }> = {
  from_card: { chip: 'bg-royal text-white', box: 'bg-pale', icon: FileCheck2 },
  general: { chip: 'bg-white text-navy ring-1 ring-mist', box: 'bg-canvas ring-1 ring-mist', icon: BookOpen },
  needs_confirmation: { chip: 'bg-caution text-caution-ink', box: 'bg-caution/50', icon: CircleHelp },
}

export function KindLabel({ kind, lang }: { kind: BlockKind; lang: Lang }) {
  const { chip, icon: Icon } = kindStyle[kind]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${chip}`}>
      <Icon className="size-3.5" aria-hidden />
      {STRINGS[lang].labels[kind]}
    </span>
  )
}

function Block({ b, lang }: { b: GuideBlock; lang: Lang }) {
  const t = STRINGS[lang]
  return (
    <div className={`rounded-2xl p-4 ${kindStyle[b.kind].box}`}>
      <KindLabel kind={b.kind} lang={lang} />
      {b.heading && <p className="mt-2 font-bold text-ink">{b.heading}</p>}
      {b.text && <p className="mt-1.5 text-sm leading-relaxed text-ink">{b.text}</p>}
      {b.items && (
        <ul className="mt-2 grid gap-1.5">
          {b.items.map((it, i) => (
            <li key={i} className="rounded-xl bg-white/80 px-3 py-2 text-sm">
              <span className="font-semibold text-ink">{it.label}</span>
              {it.detail && <span className="mt-0.5 block text-ink/80">“{it.detail}”</span>}
              {it.tag && <span className="mt-0.5 block text-xs font-semibold text-royal">{it.tag}</span>}
            </li>
          ))}
        </ul>
      )}
      {b.more && b.more.length > 0 && (
        <details className="group mt-2">
          <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1 text-sm font-semibold text-royal">
            <span className="group-open:hidden">{t.learnMore}</span>
            <span className="hidden group-open:inline">{t.showLess}</span>
            <ChevronDown className="size-4 transition group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <ul className="mt-1 grid gap-1.5 text-sm leading-relaxed text-ink/90">
            {b.more.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </details>
      )}
      {b.source && (
        <a href={b.source.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy underline-offset-2 hover:underline">
          {t.source}: {b.source.name}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
    </div>
  )
}

/** One guide topic. The id is the tour target. */
export function GuideSectionCard({
  id,
  index,
  section,
  lang,
  top,
  children,
}: {
  id: string
  index: number
  section: GuideSection
  lang: Lang
  top?: ReactNode
  children?: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="guide-target scroll-mt-24 rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-pale text-sm font-extrabold text-navy" aria-hidden>
          {index}
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-lg font-bold leading-snug text-navy">
            {section.title}
          </h2>
          <p className="mt-0.5 text-sm text-ink/75">{section.summary}</p>
        </div>
      </div>
      {top && <div className="mt-4">{top}</div>}
      <div className="mt-4 grid gap-3">
        {section.blocks.map((b, i) => (
          <Block key={i} b={b} lang={lang} />
        ))}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}
