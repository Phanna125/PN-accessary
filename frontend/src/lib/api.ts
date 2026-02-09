function normalizeApiBase(raw?: string) {
  const fallback = 'http://localhost:3000'
  const trimmed = raw?.trim()
  if (!trimmed) return fallback

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '')
  }

  const host = trimmed.replace(/^\/+|\/+$/g, '')
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)
  const protocol = isLocalHost ? 'http' : 'https'
  return `${protocol}://${host}`
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL as string | undefined,
)

export function getApiBase() {
  return API_BASE
}

export function getToken() {
  return localStorage.getItem('store_token')
}

function buildHeaders(useAuth: boolean, contentType?: string) {
  if (!useAuth && !contentType) return undefined

  const headers: Record<string, string> = {}
  if (contentType) headers['Content-Type'] = contentType

  if (useAuth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  const raw = await response.text()
  if (!raw.trim()) return undefined

  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback

  const message = (data as { message?: unknown }).message
  if (Array.isArray(message)) {
    const text = message
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(', ')
    return text || fallback
  }

  if (typeof message === 'string' && message.trim()) {
    return message
  }

  return fallback
}

export async function apiGet<T>(path: string, useAuth = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(useAuth),
  })
  const data = await parseBody<T>(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Request failed'))
  }
  return (data as T) ?? ({} as T)
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  useAuth = false,
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(useAuth, 'application/json'),
    body: JSON.stringify(body),
  })
  const data = await parseBody<T>(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Request failed'))
  }
  return (data as T) ?? ({} as T)
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  useAuth = false,
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(useAuth, 'application/json'),
    body: JSON.stringify(body),
  })
  const data = await parseBody<T>(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Request failed'))
  }
  return (data as T) ?? ({} as T)
}

export async function apiDelete<T>(path: string, useAuth = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(useAuth),
  })
  const data = await parseBody<T>(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Request failed'))
  }
  return (data as T) ?? ({} as T)
}

export async function apiUpload(path: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: formData,
  })
  const data = await parseBody<{ url?: string; message?: string }>(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Upload failed'))
  }
  if (!data?.url) throw new Error('Upload failed')
  return data.url
}
