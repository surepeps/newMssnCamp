import { toast } from 'sonner'

const BASE_URL = 'https://demo-api.mssnlagos.net/api/public'

async function fetchJSON(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal })
    if (!res.ok) {
      const text = await res.text()
      const message = text || `Request failed with status ${res.status}`
      throw new Error(message)
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
