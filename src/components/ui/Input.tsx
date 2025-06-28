import React from 'react'
import { use_rtl } from '../../hooks/use_rtl'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  help_text?: string
  icon_start?: React.ReactNode
  icon_end?: React.ReactNode
  required?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  help_text,
  icon_start,
  icon_end,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const { is_rtl } = use_rtl()
  const input_id = id || `input-${Math.random().toString(36).substr(2, 9)}`

  const base_input_classes = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-150 min-h-[44px]'
  const error_classes = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
  const padding_classes = (() => {
    if (icon_start && icon_end) return 'ps-12 pe-12'
    if (icon_start) return 'ps-12'
    if (icon_end) return 'pe-12'
    return 'px-4'
  })()

  return (
    <div className={className}>
      {label && (
        <label htmlFor={input_id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon_start && (
          <div className={`absolute inset-y-0 ${is_rtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <span className="text-gray-400 text-sm">
              {icon_start}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={input_id}
          className={`${base_input_classes} ${error_classes} ${padding_classes} py-3`}
          dir={is_rtl ? 'rtl' : 'ltr'}
          {...props}
        />
        
        {icon_end && (
          <div className={`absolute inset-y-0 ${is_rtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <span className="text-gray-400 text-sm">
              {icon_end}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 text-start">
          {error}
        </p>
      )}
      
      {help_text && !error && (
        <p className="mt-1 text-sm text-gray-500 text-start">
          {help_text}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'