import { FolderHeart, Hospital, House, MapPinned } from 'lucide-react'
import type { ReactNode } from 'react'
import { href } from '@/utils/router'
import { BrandMark } from '@/components/common/BrandMark'

export type Tab = 'home' | 'hospitals' | 'hotspots' | 'records'

const tabs: { id: Tab; label: string; icon: typeof House; to: string }[] = [
  { id: 'home', label: 'Home', icon: House, to: '' },
  { id: 'hospitals', label: 'Hospitals', icon: Hospital, to: 'hospitals' },
  { id: 'hotspots', label: 'Hotspots', icon: MapPinned, to: 'hotspots' },
  { id: 'records', label: 'Records', icon: FolderHeart, to: 'records' },
]

export function AppShell({ active, showBottomNav, children }: { active: Tab; showBottomNav: boolean; children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:pl-[96px]">
      <nav
        aria-label="Main"
        className="fixed inset-y-0 left-0 z-[1060] hidden w-[96px] flex-col items-center gap-2 border-r border-mist bg-white py-5 lg:flex"
      >
        <a href={href('')} className="mb-4 rounded-2xl" aria-label="PASADA: LIGTAS home">
          <BrandMark className="size-12 rounded-2xl shadow-card" />
        </a>
        {tabs.map((t) => (
          <NavItem key={t.id} tab={t} active={active === t.id} />
        ))}
      </nav>

      {children}

      {showBottomNav && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-[1060] border-t border-mist bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1.5 pb-1.5">
            {tabs.map((t) => (
              <NavItem key={t.id} tab={t} active={active === t.id} />
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}

function NavItem({ tab, active }: { tab: (typeof tabs)[number]; active: boolean }) {
  const Icon = tab.icon
  return (
    <a
      href={href(tab.to)}
      aria-current={active ? 'page' : undefined}
      className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-semibold lg:w-20 ${
        active ? 'text-royal' : 'text-ink/70 hover:text-ink'
      }`}
    >
      <span
        className={`grid h-8 w-14 place-items-center rounded-full transition ${active ? 'bg-pale' : 'group-hover:bg-pale/60'}`}
      >
        <Icon className="size-5" strokeWidth={active ? 2.4 : 2} aria-hidden />
      </span>
      {tab.label}
    </a>
  )
}
