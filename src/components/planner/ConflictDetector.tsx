import React from 'react'
import { VacationActivity } from '../../stores/vacation_store'
import { times_overlap, calculate_overlap, format_duration } from '../../utils/time_utils'

interface ConflictDetectorProps {
  activities: VacationActivity[]
  on_resolve_conflict?: (activity1_id: string, activity2_id: string) => void
}

interface ActivityConflict {
  activity1: VacationActivity
  activity2: VacationActivity
  overlap_minutes: number
}

export const ConflictDetector: React.FC<ConflictDetectorProps> = ({
  activities,
  on_resolve_conflict
}) => {
  const detect_conflicts = (): ActivityConflict[] => {
    const conflicts: ActivityConflict[] = []
    
    for (let i = 0; i < activities.length; i++) {
      for (let j = i + 1; j < activities.length; j++) {
        const activity1 = activities[i]
        const activity2 = activities[j]
        
        if (!activity1.start_time || !activity1.end_time || 
            !activity2.start_time || !activity2.end_time) {
          continue
        }
        
        if (times_overlap(
          activity1.start_time, 
          activity1.end_time,
          activity2.start_time, 
          activity2.end_time
        )) {
          const overlap_minutes = calculate_overlap(
            activity1.start_time, 
            activity1.end_time,
            activity2.start_time, 
            activity2.end_time
          )
          
          conflicts.push({
            activity1,
            activity2,
            overlap_minutes
          })
        }
      }
    }
    
    return conflicts
  }

  const conflicts = detect_conflicts()

  if (conflicts.length === 0) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h4 className="text-sm font-medium text-red-800">
          {conflicts.length === 1 ? 'התנגשות בלוח הזמנים' : `${conflicts.length} התנגשויות בלוח הזמנים`}
        </h4>
      </div>
      
      <div className="space-y-3">
        {conflicts.map((conflict, index) => (
          <div key={index} className="bg-white rounded-md p-3 border border-red-100">
            <div className="text-sm text-red-800">
              <div className="font-medium mb-1">
                התנגשות בין "{conflict.activity1.title}" ו-"{conflict.activity2.title}"
              </div>
              <div className="text-red-600 text-xs">
                חפיפה של {format_duration(conflict.overlap_minutes, 'long')}
              </div>
              <div className="text-red-600 text-xs mt-1">
                {conflict.activity1.title}: {conflict.activity1.start_time} - {conflict.activity1.end_time}
                <br />
                {conflict.activity2.title}: {conflict.activity2.start_time} - {conflict.activity2.end_time}
              </div>
            </div>
            
            {on_resolve_conflict && (
              <div className="mt-2 flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => on_resolve_conflict(conflict.activity1.id, conflict.activity2.id)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  פתור אוטומטית
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}