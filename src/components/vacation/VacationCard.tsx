import React from 'react'
import { Card, Button, ProgressIndicator } from '../ui'
import { Vacation, use_vacation_store } from '../../stores/vacation_store'
import { format_currency } from '../../utils/format_utils'
import { format_hebrew_date_short } from '../../utils/date_utils'

interface VacationCardProps {
  vacation: Vacation
}

const VacationCard: React.FC<VacationCardProps> = ({ vacation }) => {
  const { set_current_vacation, delete_vacation } = use_vacation_store()

  const get_status_color = (status: Vacation['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const get_status_text = (status: Vacation['status']) => {
    switch (status) {
      case 'draft': return 'טיוטה'
      case 'planning': return 'בתכנון'
      case 'confirmed': return 'מאושר'
      case 'completed': return 'הושלם'
      default: return status
    }
  }

  const handle_edit = () => {
    set_current_vacation(vacation)
    // Navigate to planner page
    window.location.href = '/planner'
  }

  const handle_delete = () => {
    if (window.confirm('האם אתם בטוחים שברצונכם למחוק את החופשה?')) {
      delete_vacation(vacation.id)
    }
  }

  const duration_days = Math.ceil(
    (new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group touch-feedback">
      {/* Header with gradient background */}
      <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative touch-area">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium min-h-[32px] flex items-center ${get_status_color(vacation.status)}`}>
            {get_status_text(vacation.status)}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 left-4">
          <h3 className="text-white font-bold text-lg mb-1 truncate">
            {vacation.title}
          </h3>
          <p className="text-white/90 text-sm flex items-center">
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {vacation.destination}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {format_hebrew_date_short(vacation.start_date)}
            </div>
            <div className="text-gray-500">
              {duration_days} ימים • {vacation.participants} משתתפים
            </div>
          </div>
          {vacation.budget && (
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">
                {format_currency(vacation.budget)}
              </div>
              <div className="text-xs text-gray-500">תקציב</div>
            </div>
          )}
        </div>

        {vacation.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {vacation.description}
          </p>
        )}

        {/* Progress Indicator */}
        <div className="mb-4">
          <ProgressIndicator status={vacation.status} show_label={false} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handle_edit}
            className="flex-1 text-sm touch-target-large"
          >
            ערוך
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handle_delete}
            className="text-red-600 hover:text-red-700 hover:border-red-300 px-4 touch-target-large"
          >
            מחק
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default VacationCard