import React, { Suspense, ComponentType } from 'react'

// Loading component for lazy-loaded routes
export const RouteLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">טוען...</p>
    </div>
  </div>
)

// Loading component for components within pages
export const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-500 text-sm">טוען רכיב...</p>
    </div>
  </div>
)

// Minimal loading spinner
export const SpinnerLoader: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
)

// Higher-order component for lazy loading with custom loading state
export const with_lazy_loading = <P extends object>(
  Component: ComponentType<P>,
  LoadingComponent: ComponentType = ComponentLoader
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }))
  
  return (props: P) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  )
}

// Utility for creating lazy-loaded route components
export const create_lazy_route = (
  import_fn: () => Promise<{ default: ComponentType<any> }>,
  LoadingComponent: ComponentType = RouteLoader
) => {
  const LazyComponent = React.lazy(import_fn)
  
  return (props: any) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Hook for lazy loading data or heavy computations
export const use_lazy_load = <T,>(
  load_fn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [data, set_data] = React.useState<T | null>(null)
  const [loading, set_loading] = React.useState(false)
  const [error, set_error] = React.useState<Error | null>(null)

  const load = React.useCallback(async () => {
    set_loading(true)
    set_error(null)
    
    try {
      const result = await load_fn()
      set_data(result)
    } catch (err) {
      set_error(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      set_loading(false)
    }
  }, deps)

  React.useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}

// Intersection Observer hook for lazy loading on scroll
export const use_lazy_load_on_scroll = (
  threshold = 0.1,
  root_margin = '50px'
) => {
  const [is_visible, set_is_visible] = React.useState(false)
  const [has_loaded, set_has_loaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element || has_loaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          set_is_visible(true)
          set_has_loaded(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin: root_margin,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, root_margin, has_loaded])

  return { ref, is_visible, has_loaded }
}

// Component for lazy loading images
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  loading_component?: ComponentType
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  loading_component: LoadingComponent = SpinnerLoader,
  className = '',
  ...props
}) => {
  const { ref, is_visible } = use_lazy_load_on_scroll()
  const [loaded, set_loaded] = React.useState(false)
  const [error, set_error] = React.useState(false)

  return (
    <div ref={ref} className={`relative ${className}`}>
      {is_visible ? (
        <>
          <img
            src={error ? placeholder : src}
            alt={alt}
            onLoad={() => set_loaded(true)}
            onError={() => {
              set_error(true)
              set_loaded(true)
            }}
            className={`transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            {...props}
          />
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingComponent />
            </div>
          )}
        </>
      ) : (
        <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
          <LoadingComponent />
        </div>
      )}
    </div>
  )
}

// Performance monitoring for lazy loading
export const use_performance_metrics = () => {
  const [metrics, set_metrics] = React.useState({
    first_contentful_paint: 0,
    largest_contentful_paint: 0,
    first_input_delay: 0,
    cumulative_layout_shift: 0,
  })

  React.useEffect(() => {
    if ('web-vital' in window) {
      // This would integrate with web-vitals library if available
      console.log('Web Vitals available for performance monitoring')
    }

    // Basic performance timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const timing = {
          first_contentful_paint: navigation.loadEventEnd - navigation.loadEventStart,
          largest_contentful_paint: 0, // Would need proper LCP measurement
          first_input_delay: 0, // Would need proper FID measurement  
          cumulative_layout_shift: 0, // Would need proper CLS measurement
        }
        
        set_metrics(timing)
      }
    }
  }, [])

  return metrics
}