'use client'

import { useState, useEffect } from 'react'

export function useClientPath() {
  const [pathname, setPathname] = useState<string | null>(null)

  useEffect(() => {
    setPathname(window.location.pathname)
    const onPop = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return pathname
}

export function navigateTo(href: string) {
  window.history.pushState(null, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
