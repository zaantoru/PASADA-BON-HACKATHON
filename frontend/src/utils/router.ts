import { useEffect, useState } from 'react'

export interface Route {
  path: string[]
  query: URLSearchParams
  key: string
}

function parse(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const [p, q = ''] = hash.split('?')
  return { path: p.split('/').filter(Boolean), query: new URLSearchParams(q), key: hash }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function href(to: string) {
  return `#/${to.replace(/^\/+/, '')}`
}

export function navigate(to: string, options?: { replace?: boolean }) {
  const url = href(to)
  if (options?.replace) {
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = url
  }
}
