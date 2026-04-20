import type { QueryParams, QueryPrimitive, QueryValue } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

type AuthMode = 'access' | 'refresh' | 'none'

interface HttpRequestOptions {
  authMode?: AuthMode
  query?: QueryParams
  headers?: Record<string, string>
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
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

function handleExpiredSession(): never {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  setTimeout(() => { window.location.href = '/login?expired=1' }, 100)
  throw new HttpError(401, 'Sesion expirada. Inicia sesion nuevamente.')
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

function buildPath(path: string, query?: QueryParams): string {
  if (!query) return path

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    appendQueryValue(searchParams, key, value)
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

function extractErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data
  }

  if (typeof data === 'object' && data !== null) {
    const errorData = data as { message?: unknown; msg?: unknown }
    if (typeof errorData.message === 'string') return errorData.message
    if (typeof errorData.msg === 'string') return errorData.msg
  }

  return `Error ${status}`
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

  const headers: Record<string, string> = {
    ...getAuthHeader(authMode),
    ...options.headers,
  }

  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && authMode !== 'none') {
    handleExpiredSession()
  }

  const data = await parseResponseBody(response)
  if (!response.ok) {
    throw new HttpError(response.status, extractErrorMessage(data, response.status))
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

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      ...getAuthHeader(authMode),
      ...options.headers,
    },
    body: formData,
  })

  if (response.status === 401 && authMode !== 'none') {
    handleExpiredSession()
  }

  const data = await parseResponseBody(response)
  if (!response.ok) {
    throw new HttpError(response.status, extractErrorMessage(data, response.status))
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
}
