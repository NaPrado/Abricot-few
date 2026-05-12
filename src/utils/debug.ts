const DEBUG_STORAGE_KEY = 'abricot_debug'
const ENABLE_VALUES = new Set(['1', 'true', 'yes', 'on', 'abricot', 'all'])
const DISABLE_VALUES = new Set(['0', 'false', 'no', 'off', 'none'])

type DebugPayload = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

declare global {
  interface Window {
    abricotDebug?: {
      enable: () => void
      disable: () => void
      enabled: () => boolean
    }
  }
}

function readDebugParam(): string | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  return params.get('abricotDebug') ?? params.get('debug')
}

function normalizeDebugValue(value: string | null): string | null {
  return value?.trim().toLowerCase() ?? null
}

function syncDebugFlagFromUrl(): boolean | null {
  if (typeof window === 'undefined') return null

  const value = normalizeDebugValue(readDebugParam())
  if (!value) return null

  if (ENABLE_VALUES.has(value)) {
    window.localStorage.setItem(DEBUG_STORAGE_KEY, '1')
    return true
  }

  if (DISABLE_VALUES.has(value)) {
    window.localStorage.removeItem(DEBUG_STORAGE_KEY)
    return false
  }

  return null
}

export function isAbricotDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false

  const urlValue = syncDebugFlagFromUrl()
  if (urlValue !== null) return urlValue

  return window.localStorage.getItem(DEBUG_STORAGE_KEY) === '1'
}

export function enableAbricotDebug(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEBUG_STORAGE_KEY, '1')
}

export function disableAbricotDebug(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(DEBUG_STORAGE_KEY)
}

function payloadOrEmpty(payload: DebugPayload): unknown[] {
  return payload === undefined ? [] : [serializeDebugValue(payload)]
}

function serializeDebugValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }

  if (Array.isArray(value)) {
    return value.map(serializeDebugValue)
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serializeDebugValue(nested)]),
    )
  }

  return value
}

export function debugLog(scope: string, message: string, payload?: DebugPayload): void {
  if (!isAbricotDebugEnabled()) return
  console.log(`[Abricot:${scope}] ${message}`, ...payloadOrEmpty(payload))
}

export function debugWarn(scope: string, message: string, payload?: DebugPayload): void {
  if (!isAbricotDebugEnabled()) return
  console.warn(`[Abricot:${scope}] ${message}`, ...payloadOrEmpty(payload))
}

export function debugError(scope: string, message: string, payload?: DebugPayload): void {
  if (!isAbricotDebugEnabled()) return
  console.error(`[Abricot:${scope}] ${message}`, ...payloadOrEmpty(payload))
}

export function debugSection(scope: string, title: string, payload?: DebugPayload): void {
  if (!isAbricotDebugEnabled()) return

  const line = '============================================================'
  console.groupCollapsed(
    `%c${line}\nABRICOT DEBUG | ${scope.toUpperCase()} | ${title}\n${line}`,
    'color:#f97316;font-weight:700',
  )
  console.log('time', new Date().toISOString())
  console.log('path', typeof window === 'undefined' ? '(server)' : window.location.href)
  if (payload !== undefined) console.log('payload', payload)
  console.groupEnd()
}

export function redactAuthPayload<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      const normalized = key.toLowerCase()
      if (normalized.includes('password')) return [key, '[redacted-password]']
      if (normalized.includes('token')) return [key, value ? '[present]' : '[missing]']
      return [key, value]
    }),
  ) as T
}

export function installAbricotDebugControls(): void {
  if (typeof window === 'undefined') return

  window.abricotDebug = {
    enable: enableAbricotDebug,
    disable: disableAbricotDebug,
    enabled: isAbricotDebugEnabled,
  }
}
