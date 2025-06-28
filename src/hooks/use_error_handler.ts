import React, { useState, useCallback } from 'react'
import { use_error } from '../contexts/app_context'

interface UseErrorHandlerReturn {
  error: string | null
  set_error: (error: string | null) => void
  clear_error: () => void
  handle_error: (error: unknown) => void
  handle_async_error: <T>(promise: Promise<T>) => Promise<T | null>
}

export const use_error_handler = (): UseErrorHandlerReturn => {
  const { error, set_error } = use_error()
  const [local_error, set_local_error] = useState<string | null>(null)
  
  const final_error = error || local_error
  
  const clear_error = useCallback(() => {
    set_error(null)
    set_local_error(null)
  }, [set_error])
  
  const handle_error = useCallback((error: unknown) => {
    let error_message: string
    
    if (error instanceof Error) {
      error_message = error.message
    } else if (typeof error === 'string') {
      error_message = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      error_message = String((error as { message: unknown }).message)
    } else {
      error_message = 'אירעה שגיאה לא צפויה'
    }
    
    console.error('Error handled:', error)
    set_local_error(error_message)
  }, [])
  
  const handle_async_error = useCallback(async <T>(promise: Promise<T>): Promise<T | null> => {
    try {
      return await promise
    } catch (error) {
      handle_error(error)
      return null
    }
  }, [handle_error])
  
  const final_set_error = useCallback((error: string | null) => {
    if (set_error) {
      set_error(error)
    } else {
      set_local_error(error)
    }
  }, [set_error])
  
  return {
    error: final_error,
    set_error: final_set_error,
    clear_error,
    handle_error,
    handle_async_error,
  }
}

// Higher-order component for error handling
export const with_error_handling = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { handle_error } = use_error_handler()
    
    const enhanced_props = {
      ...props,
      on_error: handle_error,
    } as P & { on_error: (error: unknown) => void }
    
    return React.createElement(Component, enhanced_props)
  }
}