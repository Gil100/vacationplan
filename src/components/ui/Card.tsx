import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  rounded = 'md'
}) => {
  const padding_classes = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const shadow_classes = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
  
  const rounded_classes = {
    none: '',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl'
  }
  
  const border_classes = border ? 'border border-gray-200' : ''

  const classes = `
    bg-white 
    ${padding_classes[padding]} 
    ${shadow_classes[shadow]} 
    ${rounded_classes[rounded]} 
    ${border_classes}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={classes}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-3 mb-4 ${className}`}>
    {children}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '', 
  level = 3 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  const size_classes = {
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
    4: 'text-base',
    5: 'text-sm',
    6: 'text-xs'
  }

  return (
    <Tag className={`font-semibold text-gray-900 hebrew-title ${size_classes[level]} ${className}`}>
      {children}
    </Tag>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`hebrew-body ${className}`}>
    {children}
  </div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-3 mt-4 ${className}`}>
    {children}
  </div>
)