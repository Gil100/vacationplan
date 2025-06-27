import React, { useState } from 'react'
import { VacationActivity, use_activities } from '../../stores/vacation_store'
import { auto_schedule_activities, calculate_duration } from '../../utils/time_utils'

interface DayActionsProps {
  vacation_id: string
  current_day: number
  total_days: number
  day_activities: VacationActivity[]
  on_auto_schedule?: () => void
}

export const DayActions: React.FC<DayActionsProps> = ({
  vacation_id,
  current_day,
  total_days,
  day_activities,
  on_auto_schedule
}) => {
  const { add_activity, update_activity } = use_activities()
  const [show_copy_menu, set_show_copy_menu] = useState(false)
  const [show_schedule_menu, set_show_schedule_menu] = useState(false)

  const copy_day_to = (target_day: number) => {
    day_activities.forEach(activity => {
      add_activity({
        vacation_id,
        day: target_day,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        start_time: activity.start_time,
        end_time: activity.end_time,
        cost: activity.cost,
        category: activity.category,
        notes: activity.notes
      })
    })
    set_show_copy_menu(false)
  }

  const auto_schedule_day = () => {
    const activities_to_schedule = day_activities.map(activity => ({
      id: activity.id,
      start_time: activity.start_time,
      duration_minutes: activity.start_time && activity.end_time 
        ? Math.max(60, calculate_duration(activity.start_time, activity.end_time))
        : 60
    }))

    const scheduled = auto_schedule_activities(activities_to_schedule)
    
    scheduled.forEach(({ id, start_time, end_time }) => {
      update_activity(id, { start_time, end_time })
    })
    
    set_show_schedule_menu(false)
    on_auto_schedule?.()
  }

  const clear_day = () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את כל הפעילויות של יום ${current_day}?`)) {
      day_activities.forEach(activity => {
        // In a real app, you'd have a delete function here
        // For now, we'll just clear the times
        update_activity(activity.id, { start_time: '', end_time: '' })
      })
    }
  }

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      {/* Auto Schedule */}
      {day_activities.length > 0 && (
        <div className="relative">
          <button
            onClick={() => set_show_schedule_menu(!show_schedule_menu)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="ארגון אוטומטי"
          >
            <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            ארגון אוטומטי
          </button>
          
          {show_schedule_menu && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={auto_schedule_day}
                  className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  ארגן פעילויות בלוח זמנים
                </button>
                <button
                  onClick={clear_day}
                  className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  נקה את לוח הזמנים
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copy Day */}
      {day_activities.length > 0 && (
        <div className="relative">
          <button
            onClick={() => set_show_copy_menu(!show_copy_menu)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            title="העתק יום"
          >
            <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            העתק יום
          </button>
          
          {show_copy_menu && (
            <div className="absolute top-full mt-1 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <div className="text-xs text-gray-500 px-3 py-1 font-medium">
                  העתק ליום:
                </div>
                {Array.from({ length: total_days }, (_, index) => {
                  const day = index + 1
                  if (day === current_day) return null
                  
                  return (
                    <button
                      key={day}
                      onClick={() => copy_day_to(day)}
                      className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      יום {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}