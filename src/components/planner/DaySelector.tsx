import React from 'react'
import { VacationActivity } from '../../stores/vacation_store'
import { format_hebrew_date } from '../../utils/date_utils'

interface DaySelectorProps {
  total_days: number
  selected_day: number
  on_day_select: (day: number) => void
  start_date: string
  activities: VacationActivity[]
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  total_days,
  selected_day,
  on_day_select,
  start_date,
  activities
}) => {
  const get_day_activity_count = (day: number): number => {
    return activities.filter(activity => activity.day === day).length
  }

  const get_day_date = (day: number): Date => {
    return new Date(new Date(start_date).getTime() + (day - 1) * 24 * 60 * 60 * 1000)
  }

  const get_day_status = (day: number): 'empty' | 'partial' | 'full' => {
    const activity_count = get_day_activity_count(day)
    if (activity_count === 0) return 'empty'
    if (activity_count < 3) return 'partial'
    return 'full'
  }

  const get_status_color = (status: string): string => {
    switch (status) {
      case 'empty': return 'bg-gray-100 text-gray-400'
      case 'partial': return 'bg-yellow-100 text-yellow-600'
      case 'full': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-400'
    }
  }

  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: total_days }, (_, index) => {
        const day = index + 1
        const date = get_day_date(day)
        const activity_count = get_day_activity_count(day)
        const status = get_day_status(day)
        const is_selected = day === selected_day

        return (
          <button
            key={day}
            onClick={() => on_day_select(day)}
            className={`w-full p-3 rounded-lg text-right transition-all ${
              is_selected
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  is_selected ? 'bg-blue-400 text-white' : get_status_color(status)
                }`}>
                  {activity_count}
                </span>
                <span className="text-sm font-medium">
                  יום {day}
                </span>
              </div>
              <div className="text-sm opacity-75">
                {format_hebrew_date(date, 'short')}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}