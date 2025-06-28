import React, { useState } from 'react'
import { VacationActivity } from '../../stores/vacation_store'

interface ActivityCardProps {
  activity: VacationActivity
  on_drag_start: () => void
  on_update: (updates: Partial<VacationActivity>) => void
  on_delete: () => void
  on_share?: () => void
  show_share_button?: boolean
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  on_drag_start,
  on_update,
  on_delete,
  on_share,
  show_share_button = true
}) => {
  const [is_editing, set_is_editing] = useState(false)
  const [edit_values, set_edit_values] = useState({
    title: activity.title,
    description: activity.description || '',
    location: activity.location || '',
    start_time: activity.start_time || '',
    end_time: activity.end_time || '',
    cost: activity.cost || 0,
    notes: activity.notes || ''
  })

  const get_category_color = (category: string): string => {
    const colors = {
      accommodation: 'bg-blue-100 text-blue-800',
      food: 'bg-green-100 text-green-800',
      activity: 'bg-purple-100 text-purple-800',
      transport: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const get_category_label = (category: string): string => {
    const labels = {
      accommodation: 'לינה',
      food: 'אוכל',
      activity: 'פעילות',
      transport: 'תחבורה',
      other: 'אחר'
    }
    return labels[category as keyof typeof labels] || labels.other
  }

  const handle_save = () => {
    on_update(edit_values)
    set_is_editing(false)
  }

  const handle_cancel = () => {
    set_edit_values({
      title: activity.title,
      description: activity.description || '',
      location: activity.location || '',
      start_time: activity.start_time || '',
      end_time: activity.end_time || '',
      cost: activity.cost || 0,
      notes: activity.notes || ''
    })
    set_is_editing(false)
  }

  if (is_editing) {
    return (
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            value={edit_values.title}
            onChange={(e) => set_edit_values({ ...edit_values, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            placeholder="שם הפעילות"
          />
          
          <textarea
            value={edit_values.description}
            onChange={(e) => set_edit_values({ ...edit_values, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right h-20 resize-none"
            placeholder="תיאור הפעילות"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={edit_values.start_time}
              onChange={(e) => set_edit_values({ ...edit_values, start_time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-right"
            />
            <input
              type="time"
              value={edit_values.end_time}
              onChange={(e) => set_edit_values({ ...edit_values, end_time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-right"
            />
          </div>

          <input
            type="text"
            value={edit_values.location}
            onChange={(e) => set_edit_values({ ...edit_values, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            placeholder="מיקום"
          />

          <input
            type="number"
            value={edit_values.cost}
            onChange={(e) => set_edit_values({ ...edit_values, cost: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            placeholder="עלות (₪)"
          />

          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <button
              onClick={handle_cancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              ביטול
            </button>
            <button
              onClick={handle_save}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              שמור
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <h5 className="font-medium text-gray-900">{activity.title}</h5>
            <span className={`px-2 py-1 text-xs rounded-full ${get_category_color(activity.category)}`}>
              {get_category_label(activity.category)}
            </span>
          </div>

          {activity.description && (
            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
          )}

          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
            {(activity.start_time || activity.end_time) && (
              <span>
                {activity.start_time && activity.end_time
                  ? `${activity.start_time} - ${activity.end_time}`
                  : activity.start_time || activity.end_time
                }
              </span>
            )}
            
            {activity.location && (
              <span className="flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {activity.location}
              </span>
            )}

            {activity.cost && activity.cost > 0 && (
              <span className="flex items-center font-medium text-green-600">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {activity.cost} ₪
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {show_share_button && on_share && (
            <button
              onClick={on_share}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="שתף לימים אחרים"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => set_is_editing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="עריכה"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={on_delete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="מחיקה"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}