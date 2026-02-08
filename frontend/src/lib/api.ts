const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000'

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

export async function apiGet<T>(path: string, useAuth = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(useAuth),
  })
  const data = (await response.json()) as T
  if (!response.ok) {
    throw new Error((data as any)?.message ?? 'Request failed')
  }
  return data
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
  const data = (await response.json()) as T
  if (!response.ok) {
    throw new Error((data as any)?.message ?? 'Request failed')
  }
  return data
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
  const data = (await response.json()) as T
  if (!response.ok) {
    throw new Error((data as any)?.message ?? 'Request failed')
  }
  return data
}

export async function apiDelete<T>(path: string, useAuth = false) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(useAuth),
  })
  const data = (await response.json()) as T
  if (!response.ok) {
    throw new Error((data as any)?.message ?? 'Request failed')
  }
  return data
}

export async function apiUpload(path: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: formData,
  })
  const data = (await response.json()) as { url?: string; message?: string }
  if (!response.ok) {
    throw new Error(data?.message ?? 'Upload failed')
  }
  if (!data.url) throw new Error('Upload failed')
  return data.url
}
