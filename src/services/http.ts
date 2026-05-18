import type { ApiErrorResponse, QueryPrimitive, QueryValue } from '@/types'
import { debugError, debugSection, debugWarn, redactAuthPayload } from '@/utils/debug'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
export const AUTH_EXPIRED_EVENT = 'abricot:auth-expired'
const ACCESS_TOKEN_REFRESH_PATH = '/access-tokens'

type AuthMode = 'access' | 'refresh' | 'none'

interface HttpRequestOptions {
  authMode?: AuthMode
  /** Typed query DTOs are passed through at runtime; `object` avoids index-signature friction */
  query?: object
  headers?: Record<string, string>
  /** Internal: set to true once a request has already been retried after a refresh. */
  _retried?: boolean
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

function getTokenStorageKey(authMode: AuthMode): string | null {
  if (authMode === 'none') return null
  return authMode === 'refresh' ? 'refresh_token' : 'access_token'
}

function getAuthHeader(authMode: AuthMode): Record<string, string> {
  const key = getTokenStorageKey(authMode)
  if (!key) return {}

  const token = localStorage.getItem(key)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let authExpiredEventSent = false

function handleExpiredSession(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  localStorage.removeItem('id_token')
  localStorage.removeItem('cognito_id_token')
  localStorage.removeItem('cognito_expires_in')
  localStorage.removeItem('cognito_expires_at')

  if (authExpiredEventSent) return
  authExpiredEventSent = true

  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
  window.setTimeout(() => {
    authExpiredEventSent = false
  }, 250)
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return null

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${BASE_URL}${ACCESS_TOKEN_REFRESH_PATH}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      if (!response.ok) {
        debugWarn('http', 'refresh failed', { status: response.status })
        return null
      }
      const data = (await response.json().catch(() => null)) as { accessToken?: string } | null
      if (!data?.accessToken) return null
      localStorage.setItem('access_token', data.accessToken)
      return data.accessToken
    } catch (error) {
      debugError('http', 'refresh threw', { error })
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

function appendPrimitive(searchParams: URLSearchParams, key: string, value: QueryPrimitive): void {
  if (value === null || value === undefined) return
  searchParams.append(key, String(value))
}

function appendQueryValue(searchParams: URLSearchParams, key: string, value: QueryValue): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      appendPrimitive(searchParams, key, item)
    }
    return
  }

  appendPrimitive(searchParams, key, value)
}

function buildPath(path: string, query?: object): string {
  if (!query) return path

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    appendQueryValue(searchParams, key, value as QueryValue)
  }

  const search = searchParams.toString()
  if (!search) return path

  return path.includes('?') ? `${path}&${search}` : `${path}?${search}`
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json().catch(() => undefined)
  }

  const text = await response.text().catch(() => '')
  return text.length > 0 ? text : undefined
}

function extractErrorDetails(
  data: unknown,
  status: number,
): Pick<ApiErrorResponse, 'message'> & Partial<Pick<ApiErrorResponse, 'code' | 'errors'>> {
  if (typeof data === 'string' && data.trim().length > 0) {
    return { message: data }
  }

  if (typeof data === 'object' && data !== null) {
    const errorData = data as { message?: unknown; msg?: unknown; code?: unknown; errors?: unknown }
    const message =
      typeof errorData.message === 'string'
        ? errorData.message
        : typeof errorData.msg === 'string'
          ? errorData.msg
          : `Error ${status}`

    return {
      message,
      ...(typeof errorData.code === 'string' ? { code: errorData.code } : {}),
      ...(isRecord(errorData.errors) ? { errors: errorData.errors } : {}),
    }
  }

  return { message: `Error ${status}` }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const REQUEST_TIMEOUT_MS = 10_000
let debugRequestCounter = 0

function nextDebugRequestId(): string {
  debugRequestCounter += 1
  return `http-${debugRequestCounter}`
}

function summarizeData(data: unknown): unknown {
  if (Array.isArray(data)) {
    return { type: 'array', length: data.length, firstItem: data[0] ?? null }
  }

  if (isRecord(data)) {
    return {
      type: 'object',
      keys: Object.keys(data),
      sample: redactAuthPayload(data),
    }
  }

  return data
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), ms)
  return {
    signal: controller.signal,
    cancel: () => window.clearTimeout(id),
  }
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  options: HttpRequestOptions = {},
): Promise<T> {
  const authMode = options.authMode ?? 'access'
  const url = buildPath(path, options.query)
  const hasBody = body !== undefined
  const debugRequestId = nextDebugRequestId()
  const startedAt = Date.now()

  const headers: Record<string, string> = {
    ...getAuthHeader(authMode),
    ...options.headers,
  }

  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  const { signal, cancel } = withTimeout(REQUEST_TIMEOUT_MS)

  debugSection('http', `${debugRequestId} request start`, {
    method,
    url,
    authMode,
    hasAuthorization: Boolean(headers.Authorization),
    query: options.query ?? null,
    body: hasBody && isRecord(body) ? redactAuthPayload(body) : summarizeData(body),
  })

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    }).finally(cancel)
  } catch (error) {
    debugError('http', `${debugRequestId} network failure`, {
      method,
      url,
      authMode,
      durationMs: Date.now() - startedAt,
      error,
    })
    throw error
  }

  const data = await parseResponseBody(response)

  debugSection('http', `${debugRequestId} response`, {
    method,
    url,
    status: response.status,
    ok: response.ok,
    durationMs: Date.now() - startedAt,
    data: summarizeData(data),
  })

  if (response.status === 401 && authMode === 'access' && !options._retried && path !== ACCESS_TOKEN_REFRESH_PATH) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      debugSection('http', `${debugRequestId} retrying after refresh`, { method, url })
      return request<T>(method, path, body, { ...options, _retried: true })
    }
  }

  if (response.status === 401 && authMode !== 'none') {
    handleExpiredSession()
  }

  if (!response.ok) {
    const error = extractErrorDetails(data, response.status)
    debugWarn('http', `${debugRequestId} throwing HttpError`, {
      method,
      url,
      status: response.status,
      error,
    })
    throw new HttpError(response.status, error.message, error.code, error.errors)
  }

  return data as T
}

async function upload<T>(
  method: string,
  path: string,
  formData: FormData,
  options: HttpRequestOptions = {},
): Promise<T> {
  const authMode = options.authMode ?? 'access'
  const url = buildPath(path, options.query)
  const debugRequestId = nextDebugRequestId()
  const startedAt = Date.now()

  const { signal, cancel } = withTimeout(REQUEST_TIMEOUT_MS)

  const headers = {
    ...getAuthHeader(authMode),
    ...options.headers,
  }

  debugSection('http', `${debugRequestId} upload start`, {
    method,
    url,
    authMode,
    hasAuthorization: Boolean(headers.Authorization),
    formKeys: Array.from(formData.keys()),
  })

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: formData,
      signal,
    }).finally(cancel)
  } catch (error) {
    debugError('http', `${debugRequestId} upload network failure`, {
      method,
      url,
      authMode,
      durationMs: Date.now() - startedAt,
      error,
    })
    throw error
  }

  const data = await parseResponseBody(response)

  debugSection('http', `${debugRequestId} upload response`, {
    method,
    url,
    status: response.status,
    ok: response.ok,
    durationMs: Date.now() - startedAt,
    data: summarizeData(data),
  })

  if (response.status === 401 && authMode === 'access' && !options._retried) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      debugSection('http', `${debugRequestId} retrying upload after refresh`, { method, url })
      return upload<T>(method, path, formData, { ...options, _retried: true })
    }
  }

  if (response.status === 401 && authMode !== 'none') {
    handleExpiredSession()
  }

  if (!response.ok) {
    const error = extractErrorDetails(data, response.status)
    debugWarn('http', `${debugRequestId} throwing upload HttpError`, {
      method,
      url,
      status: response.status,
      error,
    })
    throw new HttpError(response.status, error.message, error.code, error.errors)
  }

  return data as T
}

export const http = {
  get: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: HttpRequestOptions) =>
    request<T>('DELETE', path, undefined, options),
  postForm: <T>(path: string, form: FormData, options?: HttpRequestOptions) =>
    upload<T>('POST', path, form, options),
  putForm: <T>(path: string, form: FormData, options?: HttpRequestOptions) =>
    upload<T>('PUT', path, form, options),
}
