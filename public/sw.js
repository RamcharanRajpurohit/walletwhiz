const STATIC_CACHE = 'walletwhiz-static-v3'
const API_CACHE = 'walletwhiz-api-v3'

const OFFLINE_DB_NAME = 'walletwhiz-offline'
const OFFLINE_DB_VERSION = 1
const QUEUE_STORE_NAME = 'expense-mutation-queue'
const EXPENSE_QUEUE_SYNC_TAG = 'walletwhiz-sync-expense-mutations'

const TERMINAL_STATUS_CODES = new Set([400, 401, 403, 404, 409, 422])

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE)
    await cache.addAll([
      '/login',
    ])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames
        .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
        .map((name) => caches.delete(name))
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const requestUrl = new URL(request.url)

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return
  }

  if (requestUrl.pathname.startsWith('/api/auth/')) {
    return
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstApi(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirstAsset(request))
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === EXPENSE_QUEUE_SYNC_TAG) {
    event.waitUntil(flushExpenseMutationQueue())
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting())
    return
  }

  if (event.data?.type === 'WALLETWHIZ_FLUSH_QUEUE') {
    event.waitUntil(flushExpenseMutationQueue())
  }
})

async function networkFirstApi(request) {
  const cache = await caches.open(API_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    return new Response(JSON.stringify({ message: 'Offline and no cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(STATIC_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    const fallback = await cache.match('/login')
    return fallback || Response.error()
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (response.ok) {
    await cache.put(request, response.clone())
  }

  return response
}

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
        const store = db.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Failed to open offline DB'))
  })
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'))
  })
}

async function readQueue() {
  const db = await openOfflineDb()

  try {
    const tx = db.transaction(QUEUE_STORE_NAME, 'readonly')
    const store = tx.objectStore(QUEUE_STORE_NAME)
    const items = await requestToPromise(store.getAll())
    return items.sort((a, b) => a.createdAt - b.createdAt)
  } finally {
    db.close()
  }
}

async function writeQueue(items) {
  const db = await openOfflineDb()

  try {
    const tx = db.transaction(QUEUE_STORE_NAME, 'readwrite')
    const store = tx.objectStore(QUEUE_STORE_NAME)
    const keys = await requestToPromise(store.getAllKeys())

    for (const key of keys) {
      store.delete(key)
    }

    for (const item of items) {
      store.put(item)
    }

    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'))
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'))
    })
  } finally {
    db.close()
  }
}

async function executeQueuedMutation(mutation) {
  let response

  if (mutation.kind === 'create') {
    response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mutation.payload),
    })
  } else if (mutation.kind === 'update') {
    response = await fetch(`/api/expenses/${encodeURIComponent(mutation.expenseId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mutation.payload),
    })
  } else {
    response = await fetch(`/api/expenses/${encodeURIComponent(mutation.expenseId)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  let payload = null
  try {
    payload = await response.clone().json()
  } catch {
    payload = null
  }

  if (response.ok) {
    return { ok: true, payload }
  }

  return {
    ok: false,
    terminal: TERMINAL_STATUS_CODES.has(response.status),
  }
}

async function clearApiCache() {
  const cache = await caches.open(API_CACHE)
  const keys = await cache.keys()
  await Promise.all(keys.map((key) => cache.delete(key)))
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
  for (const client of clients) {
    client.postMessage(message)
  }
}

async function flushExpenseMutationQueue() {
  const queue = await readQueue()

  if (!queue.length) {
    return
  }

  await notifyClients({
    type: 'WALLETWHIZ_QUEUE_SYNC_START',
    queued: queue.length,
  })

  let processed = 0
  const replacements = []

  for (let index = 0; index < queue.length; index += 1) {
    const mutation = queue[index]

    try {
      const result = await executeQueuedMutation(mutation)

      if (!result.ok) {
        if (result.terminal) {
          queue.splice(index, 1)
          index -= 1
          continue
        }

        break
      }

      if (mutation.kind === 'create') {
        const realId = result.payload?.expense?._id
        if (realId && realId !== mutation.expenseId) {
          const oldTempId = mutation.expenseId
          replacements.push({ tempId: oldTempId, realId })

          for (const queuedMutation of queue) {
            if (queuedMutation.expenseId === oldTempId) {
              queuedMutation.expenseId = realId
            }
          }
        }
      }

      queue.splice(index, 1)
      index -= 1
      processed += 1
    } catch {
      break
    }
  }

  await writeQueue(queue)

  await notifyClients({
    type: 'WALLETWHIZ_QUEUE_FLUSHED',
    processed,
    remaining: queue.length,
    replacements,
  })

  if (processed > 0) {
    await clearApiCache()
    await notifyClients({
      type: 'WALLETWHIZ_QUEUE_SYNCED',
      processed,
      replacements,
    })
  }
}
