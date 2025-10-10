import { toast } from 'sonner'

const BASE_URL = 'https://demo-api.mssnlagos.net/api/public'

async function fetchJSON(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal })
    if (!res.ok) {
      let message = `Request failed with status ${res.status}${res.statusText ? ' ' + res.statusText : ''}`
      try {
        const clone = res.clone()
        const ct = clone.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const data = await clone.json()
          if (data && (data.message || data.error)) message = data.message || data.error
        } else {
          const text = await clone.text()
          if (text) message = text
        }
      } catch {}
      const error = new Error(message)
      error.status = res.status
      error.statusText = res.statusText
      throw error
    }
    return await res.json()
  } catch (err) {
    const msg = err?.message || 'Network error'
    toast.error(msg.length > 300 ? msg.slice(0, 300) + '…' : msg)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export { BASE_URL, fetchJSON }
