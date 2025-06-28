import React, { useEffect, useRef, useState } from 'react'

interface TouchGestureOptions {
  on_swipe_left?: () => void
  on_swipe_right?: () => void
  on_swipe_up?: () => void
  on_swipe_down?: () => void
  on_long_press?: () => void
  swipe_threshold?: number
  long_press_duration?: number
}

interface TouchState {
  is_touching: boolean
  is_swiping: boolean
  swipe_direction: 'left' | 'right' | 'up' | 'down' | null
}

export const use_mobile_touch = (options: TouchGestureOptions = {}) => {
  const {
    on_swipe_left,
    on_swipe_right,
    on_swipe_up,
    on_swipe_down,
    on_long_press,
    swipe_threshold = 50,
    long_press_duration = 500
  } = options

  const [touch_state, set_touch_state] = useState<TouchState>({
    is_touching: false,
    is_swiping: false,
    swipe_direction: null
  })

  const touch_start_ref = useRef<{ x: number; y: number; time: number } | null>(null)
  const long_press_timer_ref = useRef<NodeJS.Timeout | null>(null)

  const handle_touch_start = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touch_start_ref.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    set_touch_state(prev => ({ ...prev, is_touching: true }))

    // Start long press timer
    if (on_long_press) {
      long_press_timer_ref.current = setTimeout(() => {
        if (touch_start_ref.current) {
          on_long_press()
          set_touch_state(prev => ({ ...prev, is_touching: false }))
        }
      }, long_press_duration)
    }
  }

  const handle_touch_move = (e: React.TouchEvent) => {
    if (!touch_start_ref.current) return

    // Clear long press timer on move
    if (long_press_timer_ref.current) {
      clearTimeout(long_press_timer_ref.current)
      long_press_timer_ref.current = null
    }

    const touch = e.touches[0]
    const delta_x = touch.clientX - touch_start_ref.current.x
    const delta_y = touch.clientY - touch_start_ref.current.y

    // Determine swipe direction
    if (Math.abs(delta_x) > swipe_threshold || Math.abs(delta_y) > swipe_threshold) {
      let direction: 'left' | 'right' | 'up' | 'down'

      if (Math.abs(delta_x) > Math.abs(delta_y)) {
        direction = delta_x > 0 ? 'right' : 'left'
      } else {
        direction = delta_y > 0 ? 'down' : 'up'
      }

      set_touch_state(prev => ({
        ...prev,
        is_swiping: true,
        swipe_direction: direction
      }))
    }
  }

  const handle_touch_end = () => {
    if (long_press_timer_ref.current) {
      clearTimeout(long_press_timer_ref.current)
      long_press_timer_ref.current = null
    }

    if (!touch_start_ref.current) return

    const touch_duration = Date.now() - touch_start_ref.current.time

    // Only trigger swipe if it was quick enough (not a long press)
    if (touch_state.is_swiping && touch_duration < long_press_duration) {
      switch (touch_state.swipe_direction) {
        case 'left':
          on_swipe_left?.()
          break
        case 'right':
          on_swipe_right?.()
          break
        case 'up':
          on_swipe_up?.()
          break
        case 'down':
          on_swipe_down?.()
          break
      }
    }

    // Reset state
    set_touch_state({
      is_touching: false,
      is_swiping: false,
      swipe_direction: null
    })
    touch_start_ref.current = null
  }

  // Native event handlers for document-level events
  const handle_touch_move_native = (e: TouchEvent) => {
    if (!touch_start_ref.current) return

    // Clear long press timer on move
    if (long_press_timer_ref.current) {
      clearTimeout(long_press_timer_ref.current)
      long_press_timer_ref.current = null
    }

    const touch = e.touches[0]
    const delta_x = touch.clientX - touch_start_ref.current.x
    const delta_y = touch.clientY - touch_start_ref.current.y

    // Determine swipe direction
    if (Math.abs(delta_x) > swipe_threshold || Math.abs(delta_y) > swipe_threshold) {
      let direction: 'left' | 'right' | 'up' | 'down'

      if (Math.abs(delta_x) > Math.abs(delta_y)) {
        direction = delta_x > 0 ? 'right' : 'left'
      } else {
        direction = delta_y > 0 ? 'down' : 'up'
      }

      set_touch_state(prev => ({
        ...prev,
        is_swiping: true,
        swipe_direction: direction
      }))
    }
  }

  const touch_handlers = {
    onTouchStart: handle_touch_start,
    onTouchMove: handle_touch_move,
    onTouchEnd: handle_touch_end,
    onTouchCancel: handle_touch_end
  }

  return {
    touch_state,
    touch_handlers
  }
}

// Hook for detecting mobile device
export const use_is_mobile = () => {
  const [is_mobile, set_is_mobile] = useState(false)

  useEffect(() => {
    const check_mobile = () => {
      const is_touch_device = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const is_small_screen = window.innerWidth <= 768
      set_is_mobile(is_touch_device && is_small_screen)
    }

    check_mobile()
    window.addEventListener('resize', check_mobile)
    
    return () => window.removeEventListener('resize', check_mobile)
  }, [])

  return is_mobile
}

// Hook for mobile-optimized scrolling
export const use_mobile_scroll = (element_ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = element_ref.current
    if (!element) return

    // Add smooth scrolling classes
    element.classList.add('scroll-smooth-mobile')

    // Prevent overscroll bounce on iOS
    const handle_touch_move_native = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.scroll-smooth-mobile')) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', handle_touch_move_native, { passive: false })

    return () => {
      document.removeEventListener('touchmove', handle_touch_move_native)
    }
  }, [element_ref])
}