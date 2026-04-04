'use client'

import { useEffect, useRef, useState } from 'react'
import {
  EXPENSE_QUEUE_STATUS_EVENT,
  getQueuedExpenseMutationCount,
} from '@/lib/offline/expense-queue'

type QueueStatusDetail = {
  pendingCount?: number
}

export function useOfflineQueueStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const syncTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let active = true

    const refreshPendingCount = async () => {
      try {
        const count = await getQueuedExpenseMutationCount()

        if (!active) {
          return
        }

        setPendingCount(count)
      } catch {
        // Ignore queue read errors in status badge.
      }
    }

    const startSyncing = () => {
      setSyncing(true)

      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = window.setTimeout(() => {
        setSyncing(false)
        syncTimeoutRef.current = null
      }, 10000)
    }

    const stopSyncing = () => {
      setSyncing(false)

      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
    }

    const handleOnline = () => {
      setIsOnline(true)
      void refreshPendingCount()
    }

    const handleOffline = () => {
      setIsOnline(false)
      stopSyncing()
    }

    const handleQueueStatus = (event: Event) => {
      const customEvent = event as CustomEvent<QueueStatusDetail>
      if (typeof customEvent.detail?.pendingCount === 'number') {
        setPendingCount(customEvent.detail.pendingCount)
      } else {
        void refreshPendingCount()
      }
    }

    const handleWorkerMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') {
        return
      }

      if (data.type === 'WALLETWHIZ_QUEUE_SYNC_START') {
        startSyncing()
        return
      }

      if (data.type === 'WALLETWHIZ_QUEUE_FLUSHED') {
        stopSyncing()

        if (typeof data.remaining === 'number') {
          setPendingCount(data.remaining)
        } else {
          void refreshPendingCount()
        }

        return
      }

      if (data.type === 'WALLETWHIZ_QUEUE_SYNCED') {
        stopSyncing()
        void refreshPendingCount()
      }
    }

    void refreshPendingCount()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener(EXPENSE_QUEUE_STATUS_EVENT, handleQueueStatus)
    navigator.serviceWorker?.addEventListener('message', handleWorkerMessage)

    return () => {
      active = false

      stopSyncing()

      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener(EXPENSE_QUEUE_STATUS_EVENT, handleQueueStatus)
      navigator.serviceWorker?.removeEventListener('message', handleWorkerMessage)
    }
  }, [])

  return {
    isOnline,
    pendingCount,
    syncing,
  }
}
