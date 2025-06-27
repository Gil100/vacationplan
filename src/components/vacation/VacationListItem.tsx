import React from 'react'
import { Card, Button } from '../ui'
import { Vacation, use_vacation_store } from '../../stores/vacation_store'
import { format_currency } from '../../utils/format_utils'
import { format_hebrew_date_short } from '../../utils/date_utils'

interface VacationListItemProps {
  vacation: Vacation
}

const VacationListItem: React.FC<VacationListItemProps> = ({ vacation }) => {
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
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {vacation.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {vacation.destination}
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${get_status_color(vacation.status)}`}>
              {get_status_text(vacation.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <div className="font-medium">תאריך התחלה</div>
              <div>{format_hebrew_date_short(vacation.start_date)}</div>
            </div>
            <div>
              <div className="font-medium">משך</div>
              <div>{duration_days} ימים</div>
            </div>
            <div>
              <div className="font-medium">משתתפים</div>
              <div>{vacation.participants}</div>
            </div>
            {vacation.budget && (
              <div>
                <div className="font-medium">תקציב</div>
                <div className="font-semibold text-gray-900">
                  {format_currency(vacation.budget)}
                </div>
              </div>
            )}
          </div>

          {vacation.description && (
            <p className="text-gray-700 text-sm line-clamp-1 mb-3">
              {vacation.description}
            </p>
          )}
        </div>

        <div className="flex gap-2 mr-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handle_edit}
          >
            ערוך
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handle_delete}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            מחק
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default VacationListItem