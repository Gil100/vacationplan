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
  let timeout: NodeJS.Timeout | null = null
  
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
  
  // @ts-ignore - hardwareConcurrency might not be available
  const cores = navigator.hardwareConcurrency || 4
  
  // @ts-ignore - deviceMemory is experimental
  const memory = (navigator as any).deviceMemory || 4
  
  // @ts-ignore - connection might not be available
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

// Initialize performance monitoring in App
export const initialize_performance_monitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ Performance monitoring initialized`)
    console.log(`⚡ Device tier: ${get_device_performance_tier()}`)
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['longtask'] })
    }
  }
}