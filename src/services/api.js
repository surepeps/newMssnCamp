const BASE_URL = 'https://demo-api.mssnlagos.net/api/public'

async function fetchJSON(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export { BASE_URL, fetchJSON }
