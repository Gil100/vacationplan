import { useState, useEffect } from 'react'

export interface NetworkInfo {
  effective_type: '2g' | '3g' | '4g' | '5g' | 'unknown'
  downlink: number
  rtt: number
  save_data: boolean
  online: boolean
}

export interface PerformanceTier {
  tier: 'low' | 'medium' | 'high'
  should_reduce_animations: boolean
  should_lazy_load_images: boolean
  should_preload_data: boolean
  max_concurrent_requests: number
}

// Hook to monitor network connection and performance
export const use_network_performance = (): NetworkInfo & PerformanceTier => {
  const [network_info, set_network_info] = useState<NetworkInfo>({
    effective_type: 'unknown',
    downlink: 0,
    rtt: 0,
    save_data: false,
    online: true
  })

  const [performance_tier, set_performance_tier] = useState<PerformanceTier>({
    tier: 'medium',
    should_reduce_animations: false,
    should_lazy_load_images: true,
    should_preload_data: true,
    max_concurrent_requests: 6
  })

  useEffect(() => {
    const update_network_info = () => {
      const navigator_any = navigator as any
      const connection = navigator_any.connection || 
                        navigator_any.mozConnection || 
                        navigator_any.webkitConnection

      const info: NetworkInfo = {
        effective_type: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        save_data: connection?.saveData || false,
        online: navigator.onLine
      }

      set_network_info(info)

      // Determine performance tier based on connection
      const tier = determine_performance_tier(info)
      set_performance_tier(tier)
    }

    // Initial check
    update_network_info()

    // Listen for network changes
    const handle_online = () => update_network_info()
    const handle_offline = () => update_network_info()
    const handle_connection_change = () => update_network_info()

    window.addEventListener('online', handle_online)
    window.addEventListener('offline', handle_offline)

    // Listen for connection changes if supported
    const navigator_any = navigator as any
    const connection = navigator_any.connection || 
                      navigator_any.mozConnection || 
                      navigator_any.webkitConnection

    if (connection) {
      connection.addEventListener('change', handle_connection_change)
    }

    return () => {
      window.removeEventListener('online', handle_online)
      window.removeEventListener('offline', handle_offline)
      if (connection) {
        connection.removeEventListener('change', handle_connection_change)
      }
    }
  }, [])

  return { ...network_info, ...performance_tier }
}

// Determine performance tier based on network conditions
const determine_performance_tier = (network: NetworkInfo): PerformanceTier => {
  if (!network.online) {
    return {
      tier: 'low',
      should_reduce_animations: true,
      should_lazy_load_images: true,
      should_preload_data: false,
      max_concurrent_requests: 1
    }
  }

  // Save data mode - reduce everything
  if (network.save_data) {
    return {
      tier: 'low',
      should_reduce_animations: true,
      should_lazy_load_images: true,
      should_preload_data: false,
      max_concurrent_requests: 2
    }
  }

  // Determine tier based on effective connection type and metrics
  switch (network.effective_type) {
    case '5g':
    case '4g':
      if (network.downlink > 5 && network.rtt < 150) {
        return {
          tier: 'high',
          should_reduce_animations: false,
          should_lazy_load_images: false,
          should_preload_data: true,
          max_concurrent_requests: 8
        }
      } else {
        return {
          tier: 'medium',
          should_reduce_animations: false,
          should_lazy_load_images: true,
          should_preload_data: true,
          max_concurrent_requests: 6
        }
      }

    case '3g':
      return {
        tier: 'medium',
        should_reduce_animations: true,
        should_lazy_load_images: true,
        should_preload_data: false,
        max_concurrent_requests: 4
      }

    case '2g':
      return {
        tier: 'low',
        should_reduce_animations: true,
        should_lazy_load_images: true,
        should_preload_data: false,
        max_concurrent_requests: 2
      }

    default:
      return {
        tier: 'medium',
        should_reduce_animations: false,
        should_lazy_load_images: true,
        should_preload_data: true,
        max_concurrent_requests: 6
      }
  }
}

// Hook for adaptive loading based on connection
export const use_adaptive_loading = () => {
  const network_perf = use_network_performance()

  return {
    // Image loading strategy
    should_load_high_res_images: network_perf.tier === 'high' && !network_perf.save_data,
    should_preload_images: network_perf.should_preload_data,
    image_quality: network_perf.tier === 'high' ? 'high' : network_perf.tier === 'medium' ? 'medium' : 'low',

    // Animation preferences
    should_use_animations: !network_perf.should_reduce_animations,
    animation_duration: network_perf.should_reduce_animations ? 0.1 : 0.3,

    // Data loading strategy
    should_preload_data: network_perf.should_preload_data,
    batch_size: network_perf.tier === 'high' ? 20 : network_perf.tier === 'medium' ? 10 : 5,
    
    // Request concurrency
    max_concurrent_requests: network_perf.max_concurrent_requests,

    // Feature enablement
    enable_auto_save: network_perf.online && network_perf.tier !== 'low',
    enable_real_time_sync: network_perf.online && network_perf.tier === 'high',
    
    // Network info for debugging
    network_info: network_perf
  }
}

// CSS class generator for adaptive styling
export const get_adaptive_css_classes = (network_perf: NetworkInfo & PerformanceTier): string => {
  const classes = []

  if (network_perf.should_reduce_animations) {
    classes.push('reduce-motion')
  }

  if (!network_perf.online) {
    classes.push('offline-mode')
  }

  if (network_perf.save_data) {
    classes.push('save-data-mode')
  }

  classes.push(`connection-${network_perf.effective_type}`)
  classes.push(`perf-tier-${network_perf.tier}`)

  return classes.join(' ')
}