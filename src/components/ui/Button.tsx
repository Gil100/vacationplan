import React from 'react'
import { use_rtl } from '../../hooks/use_rtl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon_start?: React.ReactNode
  icon_end?: React.ReactNode
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon_start,
  icon_end,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { is_rtl } = use_rtl()

  const base_classes = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target touch-feedback'
  
  const variant_classes = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500'
  }
  
  const size_classes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-5 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  }
  
  const icon_spacing = {
    sm: is_rtl ? 'ms-1.5' : 'me-1.5',
    md: is_rtl ? 'ms-2' : 'me-2',
    lg: is_rtl ? 'ms-2.5' : 'me-2.5'
  }

  const classes = `${base_classes} ${variant_classes[variant]} ${size_classes[size]} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className={`animate-spin h-4 w-4 ${icon_spacing[size]}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon_start && (
            <span className={icon_spacing[size]}>
              {icon_start}
            </span>
          )}
          {children}
          {icon_end && (
            <span className={is_rtl ? `me-${icon_spacing[size].split('-')[1]}` : `ms-${icon_spacing[size].split('-')[1]}`}>
              {icon_end}
            </span>
          )}
        </>
      )}
    </button>
  )
}