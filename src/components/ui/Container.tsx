import React, { ReactNode } from 'react'
import { clsx } from 'clsx'

interface ContainerProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'lg', 
  className 
}) => {
  const container_classes = clsx(
    'mx-auto px-4 sm:px-6 lg:px-8',
    {
      'max-w-2xl': size === 'sm',
      'max-w-4xl': size === 'md',
      'max-w-7xl': size === 'lg',
      'max-w-full': size === 'xl',
      'w-full': size === 'full',
    },
    className
  )

  return (
    <div className={container_classes}>
      {children}
    </div>
  )
}

export default Container