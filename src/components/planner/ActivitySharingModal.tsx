import React, { useState } from 'react'
import { VacationActivity, use_activities } from '../../stores/vacation_store'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { get_category_info } from './CategoryFilter'

interface ActivitySharingModalProps {
  activity: VacationActivity
  vacation_id: string
  current_day: number
  available_days: number[]
  is_open: boolean
  on_close: () => void
}

export const ActivitySharingModal: React.FC<ActivitySharingModalProps> = ({
  activity,
  vacation_id,
  current_day,
  available_days,
  is_open,
  on_close
}) => {
  const { add_activity, activities } = use_activities(vacation_id)
  const [selected_days, set_selected_days] = useState<number[]>([])
  const [copy_mode, set_copy_mode] = useState<'copy' | 'template'>('copy')
  const [modify_times, set_modify_times] = useState(false)

  if (!is_open) return null

  const category_info = get_category_info(activity.category as any)
  
  // Get days that don't already have this activity
  const available_target_days = available_days.filter(day => {
    if (day === current_day) return false
    
    // Check if this activity already exists on this day
    const day_activities = activities.filter(act => act.day === day)
    const has_same_activity = day_activities.some(act => 
      act.title === activity.title && act.location === activity.location
    )
    
    return !has_same_activity
  })

  const handle_day_toggle = (day: number) => {
    if (selected_days.includes(day)) {
      set_selected_days(selected_days.filter(d => d !== day))
    } else {
      set_selected_days([...selected_days, day])
    }
  }

  const handle_copy_activity = () => {
    selected_days.forEach(day => {
      const new_activity: Omit<VacationActivity, 'id'> = {
        vacation_id,
        day,
        title: copy_mode === 'template' ? `${activity.title} (מותאם)` : activity.title,
        description: activity.description,
        location: activity.location,
        start_time: modify_times ? undefined : activity.start_time,
        end_time: modify_times ? undefined : activity.end_time,
        cost: copy_mode === 'template' ? 0 : activity.cost,
        category: activity.category,
        notes: copy_mode === 'template' ? 'הועתק כתבנית' : activity.notes
      }
      
      add_activity(new_activity)
    })
    
    on_close()
  }

  const handle_select_all = () => {
    if (selected_days.length === available_target_days.length) {
      set_selected_days([])
    } else {
      set_selected_days([...available_target_days])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={on_close}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900">שיתוף פעילות</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Activity Preview */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <span className={`text-xs px-2 py-1 rounded ${category_info.color}`}>
                {category_info.label}
              </span>
              <div className="text-right flex-1 mx-3">
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                {activity.location && (
                  <p className="text-sm text-gray-600 mt-1">{activity.location}</p>
                )}
                {activity.start_time && activity.end_time && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.start_time} - {activity.end_time}
                  </p>
                )}
              </div>
              <span className="text-lg">{category_info.icon}</span>
            </div>
          </Card>

          {/* Copy Mode */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">אופן העתקה</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="copy_mode"
                  value="copy"
                  checked={copy_mode === 'copy'}
                  onChange={(e) => set_copy_mode(e.target.value as 'copy' | 'template')}
                  className="text-blue-600"
                />
                <div className="text-right">
                  <div className="font-medium text-gray-900">העתקה מלאה</div>
                  <div className="text-sm text-gray-600">
                    העתק את הפעילות עם כל הפרטים (זמנים, עלות, הערות)
                  </div>
                </div>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="copy_mode"
                  value="template"
                  checked={copy_mode === 'template'}
                  onChange={(e) => set_copy_mode(e.target.value as 'copy' | 'template')}
                  className="text-blue-600"
                />
                <div className="text-right">
                  <div className="font-medium text-gray-900">תבנית פעילות</div>
                  <div className="text-sm text-gray-600">
                    העתק רק את שם הפעילות והמיקום (ללא זמנים ועלות)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Time Modification */}
          {copy_mode === 'copy' && (
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={modify_times}
                  onChange={(e) => set_modify_times(e.target.checked)}
                  className="text-blue-600"
                />
                <div className="text-right">
                  <div className="font-medium text-gray-900">אל תעתיק זמנים</div>
                  <div className="text-sm text-gray-600">
                    השאר את שדות הזמן ריקים לעריכה ידנית
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Day Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handle_select_all}
                className="text-xs"
              >
                {selected_days.length === available_target_days.length ? 'בטל הכל' : 'בחר הכל'}
              </Button>
              <h4 className="text-sm font-medium text-gray-900">
                בחר ימים ({available_target_days.length} זמינים)
              </h4>
            </div>

            {available_target_days.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                אין ימים זמינים להעתקה
                <br />
                הפעילות כבר קיימת בכל הימים האחרים
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {available_target_days.map(day => (
                <button
                  key={day}
                  onClick={() => handle_day_toggle(day)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${selected_days.includes(day)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-medium">יום {day}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={on_close}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button
              variant="primary"
              onClick={handle_copy_activity}
              disabled={selected_days.length === 0}
              className="flex-1"
            >
              העתק לימים ({selected_days.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}