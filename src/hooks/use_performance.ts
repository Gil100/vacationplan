import { useEffect, useCallback, useState, useRef } from 'react'

interface PerformanceMetrics {
  memory_usage: number
  component_render_time: number
  total_components: number
  slow_components: string[]
  bundle_size: number
  cache_hit_ratio: number
}

interface UsePerformanceOptions {
  enable_monitoring?: boolean
  slow_threshold_ms?: number
  memory_check_interval?: number
}

export const use_performance = (options: UsePerformanceOptions = {}) => {
  const {
    enable_monitoring = process.env.NODE_ENV === 'development',
    slow_threshold_ms = 16, // 60fps threshold
    memory_check_interval = 10000
  } = options

  const [metrics, set_metrics] = useState<PerformanceMetrics>({
    memory_usage: 0,
    component_render_time: 0,
    total_components: 0,
    slow_components: [],
    bundle_size: 0,
    cache_hit_ratio: 0
  })

  const render_times = useRef<Map<string, number>>(new Map())
  const component_count = useRef(0)

  // Monitor memory usage
  useEffect(() => {
    if (!enable_monitoring) return

    const check_memory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usage_mb = memory.usedJSHeapSize / 1024 / 1024
        
        set_metrics(prev => ({
          ...prev,
          memory_usage: usage_mb
        }))

        // Warn if memory usage is high
        if (usage_mb > 50) {
          console.warn(`High memory usage detected: ${usage_mb.toFixed(2)}MB`)
        }
      }
    }

    check_memory()
    const interval = setInterval(check_memory, memory_check_interval)
    
    return () => clearInterval(interval)
  }, [enable_monitoring, memory_check_interval])

  // Component render time tracking
  const start_render_timing = useCallback((component_name: string) => {
    if (!enable_monitoring) return

    const start_time = performance.now()
    render_times.current.set(component_name, start_time)
    component_count.current++
  }, [enable_monitoring])

  const end_render_timing = useCallback((component_name: string) => {
    if (!enable_monitoring) return

    const start_time = render_times.current.get(component_name)
    if (start_time) {
      const render_time = performance.now() - start_time
      
      set_metrics(prev => {
        const new_slow_components = render_time > slow_threshold_ms
          ? [...prev.slow_components.filter(name => name !== component_name), component_name]
          : prev.slow_components.filter(name => name !== component_name)

        return {
          ...prev,
          component_render_time: render_time,
          total_components: component_count.current,
          slow_components: new_slow_components
        }
      })

      if (render_time > slow_threshold_ms) {
        console.warn(`Slow component detected: ${component_name} took ${render_time.toFixed(2)}ms to render`)
      }

      render_times.current.delete(component_name)
    }
  }, [enable_monitoring, slow_threshold_ms])

  // Performance optimization suggestions
  const get_optimization_suggestions = useCallback(() => {
    const suggestions: string[] = []

    if (metrics.memory_usage > 50) {
      suggestions.push('זיכרון גבוה - שקול lazy loading או memoization')
    }

    if (metrics.slow_components.length > 0) {
      suggestions.push(`רכיבים איטיים זוהו: ${metrics.slow_components.join(', ')}`)
    }

    if (metrics.bundle_size > 500) {
      suggestions.push('גודל bundle גדול - שקול code splitting')
    }

    if (metrics.cache_hit_ratio < 0.7) {
      suggestions.push('יעילות cache נמוכה - בדוק אסטרטגיית caching')
    }

    return suggestions
  }, [metrics])

  return {
    metrics,
    start_render_timing,
    end_render_timing,
    optimization_suggestions: get_optimization_suggestions()
  }
}

// Hook for debouncing expensive operations
export const use_debounced_callback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const callback_ref = useRef(callback)
  const timeout_ref = useRef<NodeJS.Timeout>()

  useEffect(() => {
    callback_ref.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>) => {
    if (timeout_ref.current) {
      clearTimeout(timeout_ref.current)
    }

    timeout_ref.current = setTimeout(() => {
      callback_ref.current(...args)
    }, delay)
  }, [delay]) as T
}

// Hook for throttling expensive operations
export const use_throttled_callback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const callback_ref = useRef(callback)
  const last_run = useRef<number>(0)

  useEffect(() => {
    callback_ref.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - last_run.current >= delay) {
      callback_ref.current(...args)
      last_run.current = Date.now()
    }
  }, [delay]) as T
}