const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("access_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function handleExpiredSession(): never {
  localStorage.removeItem("access_token")
  localStorage.removeItem("user")
  // Small delay so a toast could be shown before redirect if needed
  setTimeout(() => {
    window.location.href = "/login?expired=1"
  }, 100)
  throw new ApiError(401, "Sesión expirada. Iniciá sesión nuevamente.")
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })


  if (res.status === 401) {
    handleExpiredSession()
  }

  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json()

  if (!res.ok) {
    const message: string = data?.message ?? data?.msg ?? `Error ${res.status}`
    throw new ApiError(res.status, message)
  }

  return data as T
}

async function upload<T>(method: string, path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...getAuthHeader() },
    body: formData,
  })

  if (res.status === 401) {
    handleExpiredSession()
  }

  const data = await res.json()

  if (!res.ok) {
    const message: string = data?.message ?? data?.msg ?? `Error ${res.status}`
    throw new ApiError(res.status, message)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  postForm: <T>(path: string, formData: FormData) => upload<T>("POST", path, formData),
}
