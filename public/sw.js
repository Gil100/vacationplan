// Service Worker for Vacation Planning App
const CACHE_VERSION = '1.2.0'
const STATIC_CACHE_NAME = `static-v${CACHE_VERSION}`
const DYNAMIC_CACHE_NAME = `dynamic-v${CACHE_VERSION}`
const FONT_CACHE_NAME = `fonts-v${CACHE_VERSION}`
const API_CACHE_NAME = `api-v${CACHE_VERSION}`

// Cache configuration
const CACHE_CONFIG = {
  static: {
    name: STATIC_CACHE_NAME,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 100
  },
  dynamic: {
    name: DYNAMIC_CACHE_NAME,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 50
  },
  fonts: {
    name: FONT_CACHE_NAME,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 20
  },
  api: {
    name: API_CACHE_NAME,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 100
  }
}

// Assets to cache immediately (critical path)
const STATIC_ASSETS = [
  '/vacationplan/',
  '/vacationplan/index.html',
  '/vacationplan/manifest.json',
  '/vacationplan/offline.html',
  // CSS and JS files will be cached automatically by network-first strategy
]

// Network patterns for different caching strategies
const CACHE_STRATEGIES = {
  // Cache first - for static assets (JS, CSS, fonts)
  cacheFirst: /\.(js|css|woff2?|eot|ttf|otf)$/,
  
  // Network first - for HTML pages and API calls
  networkFirst: /\.(html|json)$|\/api\//,
  
  // Stale while revalidate - for images and other assets
  staleWhileRevalidate: /\.(png|jpe?g|gif|svg|webp|avif|ico)$/,
  
  // Network only - for real-time data
  networkOnly: /\/analytics|\/tracking/
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - implement intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Determine caching strategy based on URL patterns
  let strategy = null
  
  // Network only for tracking/analytics
  if (CACHE_STRATEGIES.networkOnly.test(url.pathname)) {
    return // Let browser handle normally
  }
  
  // Cache first for static assets
  if (CACHE_STRATEGIES.cacheFirst.test(url.pathname)) {
    strategy = cacheFirstStrategy
  }
  // Network first for dynamic content
  else if (CACHE_STRATEGIES.networkFirst.test(url.pathname) || url.pathname.startsWith('/api/')) {
    strategy = networkFirstStrategy
  }
  // Stale while revalidate for images
  else if (CACHE_STRATEGIES.staleWhileRevalidate.test(url.pathname)) {
    strategy = staleWhileRevalidateStrategy
  }
  // Default: Network first with offline fallback for pages
  else {
    strategy = networkFirstWithOfflineFallback
  }

  if (strategy) {
    event.respondWith(strategy(request))
  }
})

// Enhanced cache utilities
async function isExpired(response, maxAge) {
  if (!response) return true
  
  const dateHeader = response.headers.get('date')
  if (!dateHeader) return false
  
  const date = new Date(dateHeader)
  return (Date.now() - date.getTime()) > maxAge
}

async function cleanExpiredCache(cacheName, maxAge, maxEntries) {
  const cache = await caches.open(cacheName)
  const requests = await cache.keys()
  
  // Clean expired entries
  for (const request of requests) {
    const response = await cache.match(request)
    if (await isExpired(response, maxAge)) {
      await cache.delete(request)
    }
  }
  
  // Limit cache size
  const remainingRequests = await cache.keys()
  if (remainingRequests.length > maxEntries) {
    const toDelete = remainingRequests.slice(0, remainingRequests.length - maxEntries)
    await Promise.all(toDelete.map(request => cache.delete(request)))
  }
}

// Stale While Revalidate Strategy - for images and non-critical assets
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_CONFIG.dynamic.name)
  const cachedResponse = await cache.match(request)
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(error => {
    console.log('Background fetch failed:', request.url, error)
    return null
  })
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Don't await the fetch, let it happen in background
    fetchPromise
    return cachedResponse
  }
  
  // If no cache, wait for network
  try {
    return await fetchPromise
  } catch (error) {
    return new Response('', { status: 404 })
  }
}

// Network First Strategy - for API calls and dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for failed API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'אין חיבור לאינטרנט. הנתונים יעודכנו כשהחיבור יחזור.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Failed to load asset:', request.url)
    // Return a fallback for missing assets
    return new Response('', { status: 404 })
  }
}

// Network First with Offline Fallback - for HTML pages
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for page:', request.url)
    
    // Try to find cached version
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try to serve the main app (for SPA routing)
    const appResponse = await caches.match('/')
    if (appResponse) {
      return appResponse
    }
    
    // Last resort - offline page
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Fallback offline response
    return new Response(
      `<!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>אופליין - תכנון חופשות</title>
        <style>
          body { 
            font-family: 'Assistant', 'Heebo', sans-serif; 
            text-align: center; 
            padding: 2rem; 
            background: #f9fafb;
            color: #374151;
          }
          .container { max-width: 400px; margin: 0 auto; }
          .icon { font-size: 3rem; margin-bottom: 1rem; }
          h1 { color: #1f2937; margin-bottom: 1rem; }
          p { margin-bottom: 1.5rem; line-height: 1.6; }
          button { 
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.5rem; 
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✈️</div>
          <h1>אין חיבור לאינטרנט</h1>
          <p>נראה שאין לך חיבור לאינטרנט כרגע. אתה יכול לעדיין לצפות בחופשות ששמרת בעבר.</p>
          <button onclick="window.location.reload()">נסה שוב</button>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }
}

// Handle background sync for when connection returns
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'vacation-data-sync') {
    event.waitUntil(syncVacationData())
  }
})

// Sync vacation data when connection is restored
async function syncVacationData() {
  try {
    // Get pending changes from IndexedDB or localStorage
    const pendingChanges = await getPendingChanges()
    
    if (pendingChanges.length > 0) {
      console.log('Syncing', pendingChanges.length, 'pending changes')
      
      for (const change of pendingChanges) {
        try {
          await syncSingleChange(change)
          await removePendingChange(change.id)
        } catch (error) {
          console.error('Failed to sync change:', change.id, error)
        }
      }
      
      // Notify the app that sync is complete
      const clients = await self.clients.matchAll()
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          synced: pendingChanges.length
        })
      })
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Placeholder functions for data sync (would integrate with your data layer)
async function getPendingChanges() {
  // This would read from IndexedDB or another storage mechanism
  return []
}

async function syncSingleChange(change) {
  // This would make API calls to sync the change
  console.log('Syncing change:', change)
}

async function removePendingChange(changeId) {
  // This would remove the change from pending queue
  console.log('Removing pending change:', changeId)
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    dir: 'rtl',
    lang: 'he',
    tag: data.tag || 'vacation-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'פתח את האפליקציה'
      },
      {
        action: 'dismiss',
        title: 'סגור'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})