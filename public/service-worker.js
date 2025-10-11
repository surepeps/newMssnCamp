const CACHE_NAME = 'mssn-pwa-v1'
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key)
          return null
        })
      )
    )
  )
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
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
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
          if (response && response.type === 'basic' && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached || new Response('', { status: 503, statusText: 'Service Unavailable' }))
    })
  )
})
