import { toast } from 'sonner'

const BASE_URL = 'https://demo-api.mssnlagos.net/api/public'

function normalizeErrorMap(rawErrors) {
  if (!rawErrors || typeof rawErrors !== 'object') return null

  const normalized = {}
  let hasAny = false
  for (const [key, value] of Object.entries(rawErrors)) {
    const candidateValues = Array.isArray(value) ? value : value == null ? [] : [value]
    const cleaned = candidateValues
      .map((item) => (item == null ? '' : String(item)))
      .map((text) => text.trim())
      .filter(Boolean)

    if (cleaned.length) {
      normalized[key] = cleaned
      hasAny = true
    }
  }

  return hasAny ? normalized : null
}

async function fetchJSON(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal })

    const contentType = res.headers.get('content-type') || ''
    let bodyText = ''
    try {
      bodyText = await res.text()
    } catch {
      bodyText = ''
    }

    let data = null
    if (bodyText) {
      if (contentType.toLowerCase().includes('application/json')) {
        try {
          data = JSON.parse(bodyText)
        } catch {}
      }
      if (data == null) {
        try {
          data = JSON.parse(bodyText)
        } catch {
          data = bodyText
        }
      }
    }

    if (!res.ok) {
      const defaultMessage = `Request failed with status ${res.status}${res.statusText ? ` ${res.statusText}` : ''}`
      let message = defaultMessage

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const provided = [data.message, data.error]
          .map((val) => (typeof val === 'string' ? val.trim() : ''))
          .find((val) => val.length > 0)
        if (provided) {
          message = provided
        }
      } else if (typeof data === 'string' && data.trim().length) {
        message = data.trim()
      }

      const normalizedErrors =
        data && typeof data === 'object' ? normalizeErrorMap(data.errors) : null

      if (normalizedErrors) {
        const firstError = Object.values(normalizedErrors)
          .flat()
          .find((val) => typeof val === 'string' && val.trim().length)
        if ((!message || message === defaultMessage) && firstError) {
          message = firstError
        }
      }

      if (message === defaultMessage) {
        if (res.status === 404) message = 'Record not found.'
        else if (res.status === 400 || res.status === 422) message = 'Invalid request.'
        else if (res.status === 429) message = 'Too many attempts. Please try again later.'
        else if (res.status >= 500) message = 'Server error. Please try again shortly.'
      }

      const error = new Error(message || 'Request failed.')
      error.status = res.status
      error.statusText = res.statusText
      error.data = data
      error.errors = normalizedErrors
      error.body = bodyText
      throw error
    }

    if (data === null) {
      return {}
    }

    return data
  } catch (err) {
    const msg = err?.message || 'Network error'
    toast.error(msg.length > 300 ? `${msg.slice(0, 300)}…` : msg)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export { BASE_URL, fetchJSON }
