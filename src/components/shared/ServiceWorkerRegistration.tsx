'use client'

import { useEffect } from 'react'
import { requestExpenseQueueSync } from '@/lib/offline/expense-queue'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      const cleanupDevelopmentWorker = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map((registration) => registration.unregister()))

          if ('caches' in window) {
            const cacheKeys = await caches.keys()
            await Promise.all(
              cacheKeys
                .filter((key) => key.startsWith('walletwhiz-'))
                .map((key) => caches.delete(key))
            )
          }
        } catch {
          // Ignore cleanup errors in development mode.
        }
      }

      void cleanupDevelopmentWorker()
      return
    }

    let active = true

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

        if (!active) {
          return
        }

        if (registration.waiting && navigator.serviceWorker.controller) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        await requestExpenseQueueSync()
      } catch {
        // Service worker registration can fail in unsupported environments.
      }
    }

    const handleOnline = () => {
      void requestExpenseQueueSync()
    }

    void registerWorker()
    window.addEventListener('online', handleOnline)

    return () => {
      active = false
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
