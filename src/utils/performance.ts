// Performance utilities and monitoring

// Simple performance timer
export class PerformanceTimer {
  private start_time: number
  private marks: Map<string, number> = new Map()
  
  constructor(private label: string) {
    this.start_time = performance.now()
  }
  
  mark(name: string): void {
    const current_time = performance.now()
    this.marks.set(name, current_time - this.start_time)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${this.label}.${name}: ${(current_time - this.start_time).toFixed(2)}ms`)
    }
  }
  
  end(): number {
    const total_time = performance.now() - this.start_time
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${this.label} total: ${total_time.toFixed(2)}ms`)
    }
    
    return total_time
  }
  
  get_marks(): Map<string, number> {
    return new Map(this.marks)
  }
}

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let in_throttle = false
  
  return (...args: Parameters<T>) => {
    if (!in_throttle) {
      func(...args)
      in_throttle = true
      
      setTimeout(() => {
        in_throttle = false
      }, limit)
    }
  }
}

// Measure function execution time
export const measure_execution = <T extends (...args: any[]) => any>(
  func: T,
  label?: string
): T => {
  return ((...args: Parameters<T>) => {
    const func_label = label || func.name || 'anonymous'
    const start = performance.now()
    
    const result = func(...args)
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now()
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ ${func_label}: ${(end - start).toFixed(2)}ms`)
        }
      })
    } else {
      const end = performance.now()
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${func_label}: ${(end - start).toFixed(2)}ms`)
      }
      return result
    }
  }) as T
}

// Check if the device has good performance capabilities
export const get_device_performance_tier = (): 'low' | 'medium' | 'high' => {
  if (typeof navigator === 'undefined') return 'medium'
  
  const cores = (navigator as any).hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory || 4
  const connection = (navigator as any).connection
  const effective_type = connection?.effectiveType || '4g'
  
  // Simple heuristic based on available info
  if (cores >= 8 && memory >= 8 && (effective_type === '4g' || effective_type === '5g')) {
    return 'high'
  } else if (cores >= 4 && memory >= 4) {
    return 'medium'
  } else {
    return 'low'
  }
}

// Core Web Vitals monitoring interface
interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// Store performance metrics
const performance_metrics: Map<string, WebVitalMetric> = new Map()

// Core Web Vitals thresholds
const WEB_VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
}

// Rate a metric value
const rate_metric = (name: keyof typeof WEB_VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = WEB_VITALS_THRESHOLDS[name]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Track Core Web Vitals
const track_web_vital = (metric: WebVitalMetric) => {
  performance_metrics.set(metric.name, metric)
  
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`)
  }
  
  // In production, you could send to analytics
  // send_to_analytics(metric)
}

// Manual Core Web Vitals implementation (lightweight alternative to web-vitals library)
const measure_core_web_vitals = () => {
  // First Contentful Paint (FCP)
  if ('PerformanceObserver' in window) {
    try {
      const fcp_observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            track_web_vital({
              name: 'FCP',
              value: entry.startTime,
              rating: rate_metric('FCP', entry.startTime),
              delta: entry.startTime,
              id: `fcp-${Date.now()}`
            })
            fcp_observer.disconnect()
          }
        }
      })
      fcp_observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.warn('FCP measurement failed:', e)
    }
    
    // Largest Contentful Paint (LCP)
    try {
      const lcp_observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          track_web_vital({
            name: 'LCP',
            value: entry.startTime,
            rating: rate_metric('LCP', entry.startTime),
            delta: entry.startTime,
            id: `lcp-${Date.now()}`
          })
        }
      })
      lcp_observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP measurement failed:', e)
    }
    
    // Cumulative Layout Shift (CLS)
    try {
      let cls_value = 0
      const cls_observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls_value += (entry as any).value
          }
        }
        
        track_web_vital({
          name: 'CLS',
          value: cls_value,
          rating: rate_metric('CLS', cls_value),
          delta: cls_value,
          id: `cls-${Date.now()}`
        })
      })
      cls_observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS measurement failed:', e)
    }
    
    // First Input Delay (FID)
    try {
      const fid_observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const perfEntry = entry as any // First Input Delay entry
          const fid_value = perfEntry.processingStart - perfEntry.startTime
          track_web_vital({
            name: 'FID',
            value: fid_value,
            rating: rate_metric('FID', fid_value),
            delta: fid_value,
            id: `fid-${Date.now()}`
          })
          fid_observer.disconnect()
        }
      })
      fid_observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID measurement failed:', e)
    }
  }
  
  // Time to First Byte (TTFB) - from Navigation Timing API
  if ('performance' in window && 'getEntriesByType' in performance) {
    const nav_entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (nav_entries.length > 0) {
      const nav_entry = nav_entries[0]
      const ttfb = nav_entry.responseStart - nav_entry.requestStart
      
      track_web_vital({
        name: 'TTFB',
        value: ttfb,
        rating: rate_metric('TTFB', ttfb),
        delta: ttfb,
        id: `ttfb-${Date.now()}`
      })
    }
  }
}

// Get performance summary
export const get_performance_summary = () => {
  const summary: Record<string, any> = {}
  
  for (const [name, metric] of performance_metrics) {
    summary[name] = {
      value: metric.value,
      rating: metric.rating
    }
  }
  
  return summary
}

// Initialize performance monitoring in App
export const initialize_performance_monitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ Performance monitoring initialized`)
    console.log(`⚡ Device tier: ${get_device_performance_tier()}`)
  }
  
  // Start Core Web Vitals monitoring
  measure_core_web_vitals()
  
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const long_task_observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`)
            }
          }
        }
      })
      
      long_task_observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      console.warn('Long task monitoring failed:', e)
    }
  }
  
  // Report performance summary after page load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Performance Summary:', get_performance_summary())
        }
      }, 2000) // Wait 2 seconds for all metrics to be collected
    })
  }
}