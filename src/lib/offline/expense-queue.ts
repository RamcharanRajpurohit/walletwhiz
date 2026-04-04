import { Expense } from '@/types/expense'

const OFFLINE_DB_NAME = 'walletwhiz-offline'
const OFFLINE_DB_VERSION = 1
const QUEUE_STORE_NAME = 'expense-mutation-queue'

const TEMP_ID_PREFIX = 'tmp-expense-'
export const EXPENSE_QUEUE_SYNC_TAG = 'walletwhiz-sync-expense-mutations'
export const EXPENSE_QUEUE_STATUS_EVENT = 'walletwhiz:queue-status'

type QueueMutationKind = 'create' | 'update' | 'delete'

export type ExpenseMutationInput = Omit<Expense, '_id' | 'userId' | 'createdAt' | 'updatedAt'>

export type NormalizedExpenseMutationInput = {
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  note: string
}

export type QueuedExpenseMutation = {
  id: string
  kind: QueueMutationKind
  expenseId: string
  payload?: NormalizedExpenseMutationInput
  createdAt: number
  attempts: number
}

export type QueueDeleteResult = {
  removedUnsyncedCreate: boolean
}

function createId(prefix: string) {
  const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}${randomPart}`
}

function toIsoString(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

export function normalizeExpenseMutationInput(input: ExpenseMutationInput): NormalizedExpenseMutationInput {
  return {
    amount: Number(input.amount),
    category: input.category,
    type: input.type ?? 'expense',
    date: toIsoString(input.date as unknown as string | Date),
    note: input.note ?? '',
  }
}

export function createTempExpenseId() {
  return createId(TEMP_ID_PREFIX)
}

export function isTempExpenseId(expenseId?: string) {
  return Boolean(expenseId?.startsWith(TEMP_ID_PREFIX))
}

function openOfflineDb(): Promise<IDBDatabase> {
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
    request.onerror = () => reject(request.error ?? new Error('Failed to open offline DB'))
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  const db = await openOfflineDb()

  try {
    const tx = db.transaction(QUEUE_STORE_NAME, mode)
    const store = tx.objectStore(QUEUE_STORE_NAME)
    const result = await handler(store)

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('Offline DB transaction failed'))
      tx.onabort = () => reject(tx.error ?? new Error('Offline DB transaction aborted'))
    })

    return result
  } finally {
    db.close()
  }
}

function requestToPromise<T = unknown>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

async function readQueue() {
  return withStore('readonly', async (store) => {
    const items = await requestToPromise(store.getAll()) as QueuedExpenseMutation[]
    return items.sort((a, b) => a.createdAt - b.createdAt)
  })
}

async function writeQueue(items: QueuedExpenseMutation[]) {
  await withStore('readwrite', async (store) => {
    const existing = await requestToPromise(store.getAllKeys())

    for (const key of existing) {
      store.delete(key)
    }

    for (const item of items) {
      store.put(item)
    }
  })
}

function queueItem(kind: QueueMutationKind, expenseId: string, payload?: NormalizedExpenseMutationInput): QueuedExpenseMutation {
  return {
    id: createId('queue-'),
    kind,
    expenseId,
    payload,
    createdAt: Date.now(),
    attempts: 0,
  }
}

function emitQueueStatus(pendingCount: number) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(EXPENSE_QUEUE_STATUS_EVENT, {
    detail: {
      pendingCount,
    },
  }))
}

export async function queueCreateExpenseMutation(tempExpenseId: string, payload: ExpenseMutationInput) {
  const queue = await readQueue()
  queue.push(queueItem('create', tempExpenseId, normalizeExpenseMutationInput(payload)))
  await writeQueue(queue)
  emitQueueStatus(queue.length)
}

export async function queueUpdateExpenseMutation(expenseId: string, payload: ExpenseMutationInput) {
  const normalizedPayload = normalizeExpenseMutationInput(payload)
  const queue = await readQueue()

  if (isTempExpenseId(expenseId)) {
    const pendingCreate = queue.find((item) => item.kind === 'create' && item.expenseId === expenseId)
    if (pendingCreate) {
      pendingCreate.payload = normalizedPayload
      await writeQueue(queue)
      emitQueueStatus(queue.length)
      return
    }
  }

  const pendingDeleteIndex = queue.findIndex((item) => item.kind === 'delete' && item.expenseId === expenseId)
  if (pendingDeleteIndex >= 0) {
    queue.splice(pendingDeleteIndex, 1)
  }

  const pendingUpdate = queue.find((item) => item.kind === 'update' && item.expenseId === expenseId)
  if (pendingUpdate) {
    pendingUpdate.payload = normalizedPayload
    await writeQueue(queue)
    emitQueueStatus(queue.length)
    return
  }

  queue.push(queueItem('update', expenseId, normalizedPayload))
  await writeQueue(queue)
  emitQueueStatus(queue.length)
}

export async function queueDeleteExpenseMutation(expenseId: string): Promise<QueueDeleteResult> {
  const queue = await readQueue()

  if (isTempExpenseId(expenseId)) {
    const nextQueue = queue.filter((item) => item.expenseId !== expenseId)
    await writeQueue(nextQueue)
    emitQueueStatus(nextQueue.length)
    return { removedUnsyncedCreate: true }
  }

  const nextQueue = queue.filter((item) => !(item.expenseId === expenseId && item.kind === 'update'))

  const hasDelete = nextQueue.some((item) => item.kind === 'delete' && item.expenseId === expenseId)
  if (!hasDelete) {
    nextQueue.push(queueItem('delete', expenseId))
  }

  await writeQueue(nextQueue)
  emitQueueStatus(nextQueue.length)
  return { removedUnsyncedCreate: false }
}

export async function getQueuedExpenseMutationCount() {
  const queue = await readQueue()
  return queue.length
}

export async function requestExpenseQueueSync() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.ready
  const syncRegistration = registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> }
  }

  if (syncRegistration.sync) {
    try {
      await syncRegistration.sync.register(EXPENSE_QUEUE_SYNC_TAG)
    } catch {
      // Fallback to direct message when sync registration is unavailable.
    }
  }

  registration.active?.postMessage({ type: 'WALLETWHIZ_FLUSH_QUEUE' })
}
