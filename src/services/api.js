import axios from 'axios'
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

const http = axios.create({ baseURL: BASE_URL, timeout: 15000 })

async function fetchJSON(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { Accept: 'application/json', ...(options.headers || {}) }
  let data = undefined

  if (options.body !== undefined) {
    if (typeof options.body === 'string') {
      try { data = JSON.parse(options.body) } catch { data = options.body }
    } else {
      data = options.body
    }
    if (!headers['Content-Type'] && !(headers['content-type'])) {
      headers['Content-Type'] = 'application/json'
    }
  }

  try {
    const res = await http.request({ url: path, method, headers, data, validateStatus: () => true })

    const contentType = String(res.headers?.['content-type'] || res.headers?.['Content-Type'] || '')
    const responseURL = res?.request?.responseURL || ''
    const expectedBase = BASE_URL

    // Heuristic: if final URL is not our API base or content-type is HTML, treat as redirect (likely 302 followed by auto-follow)
    const isHtml = contentType.toLowerCase().includes('text/html')
    const dataIsHtmlString = typeof res.data === 'string' && /<\s*html/i.test(res.data)
    const redirectedAway = Boolean(responseURL && !responseURL.startsWith(expectedBase))

    if (isHtml || dataIsHtmlString || redirectedAway) {
      const message = 'Unexpected redirect from API (possible 302).'
      const error = new Error(message)
      error.status = res.status || 302
      error.statusText = res.statusText || 'Found'
      error.data = res.data
      error.errors = null
      try { error.body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data) } catch { error.body = '' }
      toast.error(message)
      throw error
    }

    if (res.status < 200 || res.status >= 300) {
      // Non-2xx: normalize into error (so callers can handle e.status 422 etc.)
      let message = ''
      const bodyData = res.data
      if (bodyData && typeof bodyData === 'object' && !Array.isArray(bodyData)) {
        const provided = [bodyData.message, bodyData.error]
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
          .find((v) => v)
        if (provided) message = provided
      }
      if (!message && typeof bodyData === 'string' && bodyData.trim()) message = bodyData.trim()
      const normalizedErrors = bodyData && typeof bodyData === 'object' ? normalizeErrorMap(bodyData.errors) : null
      if (!message && normalizedErrors) {
        const first = Object.values(normalizedErrors).flat().find((t) => typeof t === 'string' && t.trim())
        if (first) message = first
      }
      if (!message) {
        if (res.status === 404) message = 'Record not found.'
        else if (res.status === 400 || res.status === 422) message = 'Invalid request.'
        else if (res.status === 429) message = 'Too many attempts. Please try again later.'
        else if (res.status >= 500) message = 'Server error. Please try again shortly.'
        else message = `Request failed with status ${res.status}`
      }
      const error = new Error(message)
      error.status = res.status
      error.statusText = res.statusText
      error.data = bodyData
      error.errors = normalizedErrors
      try { error.body = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData) } catch { error.body = '' }
      toast.error(message)
      throw error
    }

    const payload = res?.data
    return payload == null ? {} : payload
  } catch (err) {
    let status = 0
    let statusText = ''
    let bodyData = undefined
    let bodyText = ''

    if (err && err.response) {
      status = Number(err.response.status) || 0
      statusText = String(err.response.statusText || '')
      bodyData = err.response.data
      try {
        bodyText = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData)
      } catch { bodyText = '' }
    }

    let message = ''
    if (bodyData && typeof bodyData === 'object' && !Array.isArray(bodyData)) {
      const provided = [bodyData.message, bodyData.error]
        .map((val) => (typeof val === 'string' ? val.trim() : ''))
        .find((val) => val.length > 0)
      if (provided) message = provided
    }
    if (!message && typeof bodyData === 'string' && bodyData.trim().length) {
      message = bodyData.trim()
    }

    const normalizedErrors = bodyData && typeof bodyData === 'object' ? normalizeErrorMap(bodyData.errors) : null
    if (!message && normalizedErrors) {
      const firstError = Object.values(normalizedErrors).flat().find((t) => typeof t === 'string' && t.trim().length)
      if (firstError) message = firstError
    }

    if (!message) {
      if (status === 404) message = 'Record not found.'
      else if (status === 400 || status === 422) message = 'Invalid request.'
      else if (status === 429) message = 'Too many attempts. Please try again later.'
      else if (status >= 500) message = 'Server error. Please try again shortly.'
      else if (err?.code === 'ECONNABORTED') message = 'Request timed out. Please try again.'
      else message = err?.message || 'Network error'
    }

    const error = new Error(message || 'Request failed.')
    error.status = status
    error.statusText = statusText
    error.data = bodyData
    error.errors = normalizedErrors
    error.body = bodyText

    const toastMsg = (message || '').toString()
    toast.error(toastMsg.length > 300 ? `${toastMsg.slice(0, 300)}…` : toastMsg)
    throw error
  }
}

export { BASE_URL, fetchJSON }
