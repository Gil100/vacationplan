import React, { ReactNode } from 'react'
import { clsx } from 'clsx'

interface GridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

interface GridItemProps {
  children: ReactNode
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  className?: string
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 1, 
  gap = 'md', 
  className 
}) => {
  const grid_classes = clsx(
    'grid',
    {
      'grid-cols-1': cols === 1,
      'grid-cols-2': cols === 2,
      'grid-cols-3': cols === 3,
      'grid-cols-4': cols === 4,
      'grid-cols-5': cols === 5,
      'grid-cols-6': cols === 6,
      'grid-cols-12': cols === 12,
    },
    {
      'gap-2': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      'gap-8': gap === 'xl',
    },
    // Responsive breakpoints
    'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    className
  )

  return (
    <div className={grid_classes}>
      {children}
    </div>
  )
}

const GridItem: React.FC<GridItemProps> = ({ 
  children, 
  colSpan = 1, 
  className 
}) => {
  const item_classes = clsx(
    {
      'col-span-1': colSpan === 1,
      'col-span-2': colSpan === 2,
      'col-span-3': colSpan === 3,
      'col-span-4': colSpan === 4,
      'col-span-5': colSpan === 5,
      'col-span-6': colSpan === 6,
      'col-span-12': colSpan === 12,
    },
    className
  )

  return (
    <div className={item_classes}>
      {children}
    </div>
  )
}

export { Grid, GridItem }
export default Grid