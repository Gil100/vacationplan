import { useEffect, useRef } from 'react'

// Performance monitoring hook
export const use_performance = (component_name: string) => {
  const start_time = useRef<number>(Date.now())
  const mount_time = useRef<number | null>(null)
  
  useEffect(() => {
    // Component mounted
    mount_time.current = Date.now()
    const mount_duration = mount_time.current - start_time.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${component_name} mounted in ${mount_duration}ms`)
    }
    
    // Cleanup on unmount
    return () => {
      const unmount_time = Date.now()
      const total_duration = unmount_time - start_time.current
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${component_name} total lifecycle: ${total_duration}ms`)
      }
    }
  }, [component_name])
  
  const measure_operation = (operation_name: string, operation: () => void | Promise<void>) => {
    const operation_start = performance.now()
    
    const result = operation()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const operation_end = performance.now()
        const duration = operation_end - operation_start
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ ${component_name}.${operation_name}: ${duration.toFixed(2)}ms`)
        }
      })
    } else {
      const operation_end = performance.now()
      const duration = operation_end - operation_start
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${component_name}.${operation_name}: ${duration.toFixed(2)}ms`)
      }
      
      return result
    }
  }
  
  return { measure_operation }
}

// Web Vitals monitoring
export const measure_web_vitals = () => {
  if (typeof window === 'undefined') return
  
  // Measure First Contentful Paint
  const measure_fcp = () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`⚡ First Contentful Paint: ${entry.startTime.toFixed(2)}ms`)
          observer.disconnect()
        }
      }
    })
    
    observer.observe({ entryTypes: ['paint'] })
  }
  
  // Measure Largest Contentful Paint
  const measure_lcp = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last_entry = entries[entries.length - 1]
      
      console.log(`⚡ Largest Contentful Paint: ${last_entry.startTime.toFixed(2)}ms`)
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }
  
  // Measure Cumulative Layout Shift
  const measure_cls = () => {
    let cls_value = 0
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cls_value += (entry as any).value
        }
      }
      
      console.log(`⚡ Cumulative Layout Shift: ${cls_value.toFixed(4)}`)
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
  }
  
  // Only run in browser
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    measure_fcp()
    measure_lcp()
    measure_cls()
  }
}

// Resource timing monitoring
export const measure_resource_timing = () => {
  if (typeof window === 'undefined') return
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming
      
      if (resource.duration > 1000) { // Only log slow resources
        console.log(`⚠️ Slow resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`)
      }
    }
  })
  
  if ('PerformanceObserver' in window) {
    observer.observe({ entryTypes: ['resource'] })
  }
}

// Memory usage monitoring (Chrome only)
export const measure_memory_usage = () => {
  if (typeof window === 'undefined') return
  
  // @ts-ignore - performance.memory is Chrome-specific
  const memory = (performance as any).memory
  
  if (memory) {
    const used = Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100
    const total = Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100
    const limit = Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100
    
    console.log(`⚡ Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`)
  }
}