import axios from 'axios'
import { responseCatcher } from '../utils/responseCatcher.js'

const DEFAULT_BASE_URL = 'https://demo-api.mssnlagos.net/api/public'
export const BASE_URL = (import.meta?.env?.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()) || DEFAULT_BASE_URL

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

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
  withCredentials: false,
  transitional: { clarifyTimeoutError: true },
})

http.interceptors.request.use((config) => {
  const cfg = { ...config }
  try {
    const token = localStorage.getItem('token')
    if (token && !cfg.headers?.Authorization) {
      cfg.headers = cfg.headers || {}
      cfg.headers.Authorization = `Bearer ${token}`
    }
  } catch {}

  const hasBody = cfg.data != null && !(cfg.data instanceof FormData)
  if (hasBody && !cfg.headers?.['Content-Type'] && !cfg.headers?.['content-type']) {
    cfg.headers = cfg.headers || {}
    cfg.headers['Content-Type'] = 'application/json'
  }

  if (cfg.params && typeof cfg.params === 'object' && !(cfg.params instanceof URLSearchParams)) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(cfg.params)) {
      if (v === undefined || v === null) continue
      if (Array.isArray(v)) v.forEach((vv) => p.append(k, String(vv)))
      else p.append(k, String(v))
    }
    cfg.params = p
  }

  cfg.maxRetries = typeof cfg.maxRetries === 'number' ? cfg.maxRetries : 2
  cfg.retryDelayBase = typeof cfg.retryDelayBase === 'number' ? cfg.retryDelayBase : 300
  return cfg
})

http.interceptors.response.use(
  async (res) => res,
  async (error) => {
    const cfg = error?.config || {}
    const method = String(cfg.method || 'get').toUpperCase()
    const status = error?.response?.status
    const shouldRetry = (
      (status == null || status >= 500 || status === 429) && ['GET', 'HEAD', 'OPTIONS'].includes(method)
    )
    const max = typeof cfg.maxRetries === 'number' ? cfg.maxRetries : 2
    const count = cfg.__retryCount || 0

    if (shouldRetry && count < max) {
      cfg.__retryCount = count + 1
      const delay = (cfg.retryDelayBase || 300) * Math.pow(2, count) + Math.floor(Math.random() * 100)
      await sleep(delay)
      return http.request(cfg)
    }

    // Surface error via shared catcher
    try { responseCatcher(error, cfg.refreshOn401 !== false) } catch {}
    return Promise.reject(error)
  }
)

export async function fetchJSON(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { ...(options.headers || {}) }
  const notifySuccess = Boolean(options.notifySuccess)
  const refreshOn401 = options.refreshOn401 !== false
  const baseURL = options.baseURL || BASE_URL
  const timeout = typeof options.timeout === 'number' ? options.timeout : 15000
  const params = options.params || undefined
  const signal = options.signal || undefined

  let data = undefined
  if (options.body !== undefined) {
    if (typeof options.body === 'string') {
      try { data = JSON.parse(options.body) } catch { data = options.body }
    } else {
      data = options.body
    }
    if (!(data instanceof FormData) && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }
  }

  try {
    const res = await http.request({
      url: path,
      method,
      headers,
      data,
      params,
      baseURL,
      timeout,
      signal,
      validateStatus: () => true,
      refreshOn401,
      maxRetries: typeof options.maxRetries === 'number' ? options.maxRetries : undefined,
    })

    const contentType = String(res.headers?.['content-type'] || res.headers?.['Content-Type'] || '')
    const responseURL = res?.request?.responseURL || ''
    const expectedBase = baseURL

    const isHtml = contentType.toLowerCase().includes('text/html')
    const dataIsHtmlString = typeof res.data === 'string' && /<\s*html/i.test(res.data)
    const redirectedAway = Boolean(responseURL && expectedBase && !responseURL.startsWith(expectedBase))

    if (isHtml || dataIsHtmlString || redirectedAway) {
      const message = 'Unexpected redirect from API (possible 302).'
      const error = new Error(message)
      error.status = res.status || 302
      error.statusText = res.statusText || 'Found'
      error.data = res.data
      error.errors = null
      try { error.body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data) } catch { error.body = '' }
      try { responseCatcher({ response: { status: error.status, data: { message } } }, false) } catch {}
      throw error
    }

    if (res.status >= 200 && res.status < 300) {
      if (notifySuccess) {
        try { responseCatcher({ response: { status: res.status, data: res.data } }, false) } catch {}
      }
      const payload = res?.data
      return payload == null ? {} : payload
    }

    const bodyData = res.data
    const normalizedErrors = bodyData && typeof bodyData === 'object' ? normalizeErrorMap(bodyData.errors) : null

    try { responseCatcher({ response: res }, refreshOn401) } catch {}

    let message = ''
    if (bodyData && typeof bodyData === 'object' && !Array.isArray(bodyData)) {
      const provided = [bodyData.message, bodyData.error]
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .find((v) => v)
      if (provided) message = provided
    }
    if (!message && typeof bodyData === 'string' && bodyData.trim()) message = bodyData.trim()

    if (!message) {
      if (res.status === 404) message = 'Record not found.'
      else if (res.status === 400 || res.status === 422) message = 'Invalid request.'
      else if (res.status === 429) message = 'Too many attempts. Please try again later.'
      else if (res.status >= 500) message = 'Server error. Please try again shortly.'
      else message = `Request failed with status ${res.status}`
    }

    const err = new Error(message)
    err.status = res.status
    err.statusText = res.statusText
    err.data = bodyData
    err.errors = normalizedErrors
    try { err.body = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData) } catch { err.body = '' }

    throw err
  } catch (err) {
    // Network, timeout or aborted
    if (!err?.response) {
      try { responseCatcher(err, refreshOn401) } catch {}
    }

    let status = 0
    let statusText = ''
    let bodyData = undefined
    let bodyText = ''

    if (err && err.response) {
      status = Number(err.response.status) || 0
      statusText = String(err.response.statusText || '')
      bodyData = err.response.data
      try { bodyText = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData) } catch { bodyText = '' }
    }

    let message = ''
    if (bodyData && typeof bodyData === 'object' && !Array.isArray(bodyData)) {
      const provided = [bodyData.message, bodyData.error]
        .map((val) => (typeof val === 'string' ? val.trim() : ''))
        .find((val) => val.length > 0)
      if (provided) message = provided
    }
    if (!message && typeof bodyData === 'string' && bodyData.trim().length) message = bodyData.trim()

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
      else if (err?.message) message = err.message
      else message = 'Network error'
    }

    const final = new Error(message || 'Request failed.')
    final.status = status
    final.statusText = statusText
    final.data = bodyData
    final.errors = normalizedErrors
    final.body = bodyText

    throw final
  }
}

export { http }
