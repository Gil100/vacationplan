import { useState, useEffect } from 'react'
import { Direction, get_document_direction, set_document_direction } from '../utils/rtl_utils'

/**
 * React hook for managing RTL/LTR direction
 */
export const use_rtl = () => {
  const [direction, set_direction] = useState<Direction>(() => get_document_direction())

  useEffect(() => {
    // Set up observer for direction changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'dir') {
          const new_direction = get_document_direction()
          set_direction(new_direction)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    })

    return () => observer.disconnect()
  }, [])

  const change_direction = (new_direction: Direction) => {
    set_document_direction(new_direction)
    set_direction(new_direction)
  }

  const toggle_direction = () => {
    const new_direction: Direction = direction === 'rtl' ? 'ltr' : 'rtl'
    change_direction(new_direction)
  }

  return {
    direction,
    is_rtl: direction === 'rtl',
    is_ltr: direction === 'ltr',
    change_direction,
    toggle_direction
  }
}