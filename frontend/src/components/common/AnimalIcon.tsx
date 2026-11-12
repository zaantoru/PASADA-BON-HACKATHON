import { Cat, CircleHelp, Dog, PawPrint } from 'lucide-react'
import type { AnimalType } from '@/types/index'

export function AnimalIcon({ type, className = 'size-5' }: { type: AnimalType; className?: string }) {
  const Icon = type === 'dog' ? Dog : type === 'cat' ? Cat : type === 'other' ? PawPrint : CircleHelp
  return <Icon className={className} aria-hidden />
}
