import React, { useState, useEffect } from 'react'
import { use_current_vacation, use_activities } from '../../stores/vacation_store'
import { DaySelector } from './DaySelector'
import { TimelineView } from './TimelineView'
import { ActivitySidebar } from './ActivitySidebar'
import { ConflictDetector } from './ConflictDetector'
import { DayActions } from './DayActions'
import { format_hebrew_date } from '../../utils/date_utils'
import { auto_schedule_activities, calculate_duration } from '../../utils/time_utils'

export const DailyItineraryPlanner: React.FC = () => {
  const { current_vacation, activities } = use_current_vacation()
  const { update_activity } = use_activities()
  const [selected_day, set_selected_day] = useState<number>(1)
  const [sidebar_open, set_sidebar_open] = useState(false)
  
  if (!current_vacation) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            לא נבחרה חופשה
          </h3>
          <p className="text-gray-500">
            בחר חופשה מהדשבורד כדי להתחיל לתכנן את המסלול היומי
          </p>
        </div>
      </div>
    )
  }

  const vacation_days = Math.ceil(
    (new Date(current_vacation.end_date).getTime() - new Date(current_vacation.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  const day_activities = activities.filter(activity => activity.day === selected_day)

  const handle_resolve_conflict = (activity1_id: string, activity2_id: string) => {
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
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Day Selector */}
      <div className="w-64 bg-white shadow-sm border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {current_vacation.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {format_hebrew_date(new Date(current_vacation.start_date))} - {format_hebrew_date(new Date(current_vacation.end_date))}
          </p>
        </div>
        
        <DaySelector
          total_days={vacation_days}
          selected_day={selected_day}
          on_day_select={set_selected_day}
          start_date={current_vacation.start_date}
          activities={activities}
        />
      </div>

      {/* Main Timeline */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              יום {selected_day} - {format_hebrew_date(
                new Date(new Date(current_vacation.start_date).getTime() + (selected_day - 1) * 24 * 60 * 60 * 1000)
              )}
            </h3>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <DayActions
                vacation_id={current_vacation.id}
                current_day={selected_day}
                total_days={vacation_days}
                day_activities={day_activities}
              />
              <button
                onClick={() => set_sidebar_open(!sidebar_open)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {sidebar_open ? 'סגור פעילויות' : 'הוסף פעילות'}
              </button>
            </div>
          </div>
          
          <ConflictDetector 
            activities={day_activities}
            on_resolve_conflict={handle_resolve_conflict}
          />
        </div>

        <div className="flex-1 flex">
          <TimelineView
            activities={day_activities}
            selected_day={selected_day}
            vacation_id={current_vacation.id}
          />
          
          {sidebar_open && (
            <ActivitySidebar
              vacation_id={current_vacation.id}
              selected_day={selected_day}
              on_close={() => set_sidebar_open(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}