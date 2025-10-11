const CACHE_NAME = 'mssn-pwa-v1'
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
]

self.addEventListener('install', (event) => {
  // activate immediately
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Claim clients immediately so the page is controlled by the SW
      await self.clients.claim()
      const keys = await caches.keys()
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key)
          return null
        })
      )
    })()
  )
})

self.addEventListener('message', (event) => {
  if (!event.data) return
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Only handle GET requests
  if (request.method !== 'GET') return

  // For navigation (app shell), use network-first then fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Put in cache for offline
          try {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          } catch (e) {}
          return response
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          // Cache successful GET responses
          try {
            if (response && response.type === 'basic' && response.status === 200) {
              const copy = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
          } catch (e) {}
          return response
        })
        .catch(() => cached || new Response('', { status: 503, statusText: 'Service Unavailable' }))
    })
  )
})
