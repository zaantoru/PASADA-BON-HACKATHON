import { EmptyMapIllustration } from '@/components/common/Illustrations'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/common/ui'
import { href } from '@/utils/router'

export function NotFound({ title = 'Page not found', body = "This page doesn't exist or the record was removed." }: { title?: string; body?: string }) {
  return (
    <Screen title={title} back="">
      <EmptyState illustration={<EmptyMapIllustration className="w-44" />} title={title} body={body}>
        <a href={href('')} className="btn btn-primary min-h-12 rounded-full">
          Go to Home
        </a>
      </EmptyState>
    </Screen>
  )
}
