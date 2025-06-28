import { useState, useEffect, useCallback } from 'react'

interface OfflineState {
  is_online: boolean
  is_service_worker_ready: boolean
  pending_sync_count: number
  last_sync: Date | null
}

interface UseOfflineReturn extends OfflineState {
  register_service_worker: () => Promise<ServiceWorkerRegistration | void>
  force_sync: () => Promise<void>
  clear_cache: () => Promise<void>
  get_cache_size: () => Promise<number>
}

export const use_offline = (): UseOfflineReturn => {
  const [state, set_state] = useState<OfflineState>({
    is_online: navigator.onLine,
    is_service_worker_ready: false,
    pending_sync_count: 0,
    last_sync: null
  })

  // Register service worker
  const register_service_worker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/vacationplan/sw.js', {
          scope: '/vacationplan/'
        })

        console.log('Service Worker registered successfully:', registration.scope)

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const new_worker = registration.installing
          if (new_worker) {
            new_worker.addEventListener('statechange', () => {
              if (new_worker.state === 'activated') {
                console.log('Service Worker updated and activated')
                // Optionally prompt user to reload
                if (confirm('עדכון חדש זמין. רוצה לרענן את הדף?')) {
                  window.location.reload()
                }
              }
            })
          }
        })

        // Check if service worker is ready
        if (registration.active) {
          set_state(prev => ({ ...prev, is_service_worker_ready: true }))
        }

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', handle_service_worker_message)

        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        throw error
      }
    } else {
      throw new Error('Service Workers not supported')
    }
  }, [])

  // Handle messages from service worker
  const handle_service_worker_message = useCallback((event: MessageEvent) => {
    const { data } = event

    switch (data.type) {
      case 'SYNC_COMPLETE':
        set_state(prev => ({
          ...prev,
          pending_sync_count: Math.max(0, prev.pending_sync_count - data.synced),
          last_sync: new Date()
        }))
        console.log('Background sync completed:', data.synced, 'items synced')
        break

      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.url)
        break

      case 'OFFLINE_READY':
        console.log('App is ready for offline use')
        break

      default:
        console.log('Unknown service worker message:', data)
    }
  }, [])

  // Force background sync
  const force_sync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('vacation-data-sync')
        console.log('Background sync registered')
      } catch (error) {
        console.error('Background sync registration failed:', error)
        // Fallback to immediate sync attempt
        await attempt_immediate_sync()
      }
    } else {
      // Fallback for browsers without background sync
      await attempt_immediate_sync()
    }
  }, [])

  // Attempt immediate sync (fallback)
  const attempt_immediate_sync = useCallback(async () => {
    if (navigator.onLine) {
      try {
        // This would call your actual sync logic
        console.log('Attempting immediate sync...')
        
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        set_state(prev => ({
          ...prev,
          pending_sync_count: 0,
          last_sync: new Date()
        }))
        
        console.log('Immediate sync completed')
      } catch (error) {
        console.error('Immediate sync failed:', error)
      }
    }
  }, [])

  // Clear all caches
  const clear_cache = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cache_names = await caches.keys()
        await Promise.all(
          cache_names.map(cache_name => caches.delete(cache_name))
        )
        console.log('All caches cleared')
      } catch (error) {
        console.error('Failed to clear caches:', error)
        throw error
      }
    }
  }, [])

  // Get approximate cache size
  const get_cache_size = useCallback(async (): Promise<number> => {
    if ('caches' in window && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return estimate.usage || 0
      } catch (error) {
        console.error('Failed to estimate cache size:', error)
        return 0
      }
    }
    return 0
  }, [])

  // Handle online/offline status changes
  useEffect(() => {
    const handle_online = () => {
      console.log('Connection restored')
      set_state(prev => ({ ...prev, is_online: true }))
      
      // Auto-sync when coming back online
      if (state.pending_sync_count > 0) {
        force_sync()
      }
    }

    const handle_offline = () => {
      console.log('Connection lost')
      set_state(prev => ({ ...prev, is_online: false }))
    }

    window.addEventListener('online', handle_online)
    window.addEventListener('offline', handle_offline)

    return () => {
      window.removeEventListener('online', handle_online)
      window.removeEventListener('offline', handle_offline)
    }
  }, [force_sync, state.pending_sync_count])

  // Register service worker on mount
  useEffect(() => {
    register_service_worker().catch(console.error)
  }, [register_service_worker])

  return {
    ...state,
    register_service_worker,
    force_sync,
    clear_cache,
    get_cache_size
  }
}

// Hook for detecting when app is served from cache
export const use_cache_status = () => {
  const [is_cached, set_is_cached] = useState(false)
  const [cache_timestamp, set_cache_timestamp] = useState<Date | null>(null)

  useEffect(() => {
    // Check if the current page was served from cache
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation_entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      
      if (navigation_entries.length > 0) {
        const entry = navigation_entries[0]
        // If transfer size is 0, it likely came from cache
        const from_cache = entry.transferSize === 0 && entry.decodedBodySize > 0
        set_is_cached(from_cache)
        
        if (from_cache) {
          set_cache_timestamp(new Date(entry.startTime))
        }
      }
    }
  }, [])

  return {
    is_cached,
    cache_timestamp
  }
}

// Hook for managing offline queue
export const use_offline_queue = () => {
  const [queue_size, set_queue_size] = useState(0)

  const add_to_queue = useCallback((action: any) => {
    // This would add actions to an offline queue
    // Stored in IndexedDB or localStorage
    console.log('Adding to offline queue:', action)
    set_queue_size(prev => prev + 1)
  }, [])

  const process_queue = useCallback(async () => {
    // This would process the offline queue when connection is restored
    console.log('Processing offline queue...')
    set_queue_size(0)
  }, [])

  return {
    queue_size,
    add_to_queue,
    process_queue
  }
}