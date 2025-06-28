import React from 'react'
import { Vacation } from '../../stores/vacation_store'
import VacationCard from './VacationCard'
import VacationListItem from './VacationListItem'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'

interface VacationGridProps {
  vacations?: Vacation[]
  loading?: boolean
  error?: string | null
  view_mode?: 'grid' | 'list'
  on_create_vacation?: () => void
}

const VacationGrid: React.FC<VacationGridProps> = ({
  vacations = [],
  loading = false,
  error = null,
  view_mode = 'grid',
  on_create_vacation
}) => {
  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-medium mb-2">
          אירעה שגיאה בטעינת החופשות
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (vacations.length === 0) {
    return <EmptyState on_create_vacation={on_create_vacation} />
  }

  if (view_mode === 'list') {
    return (
      <div className="space-y-4">
        {vacations.map((vacation) => (
          <VacationListItem key={vacation.id} vacation={vacation} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vacations.map((vacation) => (
        <VacationCard key={vacation.id} vacation={vacation} />
      ))}
    </div>
  )
}

export default VacationGrid