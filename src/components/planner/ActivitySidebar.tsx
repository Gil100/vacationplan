import React, { useState } from 'react'
import { use_activities } from '../../stores/vacation_store'

interface ActivitySidebarProps {
  vacation_id: string
  selected_day: number
  on_close: () => void
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  vacation_id,
  selected_day,
  on_close
}) => {
  const { add_activity } = use_activities()
  const [form_data, set_form_data] = useState<{
    title: string
    description: string
    location: string
    start_time: string
    end_time: string
    cost: number
    category: 'accommodation' | 'food' | 'activity' | 'transport' | 'other'
    notes: string
  }>({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    cost: 0,
    category: 'activity',
    notes: ''
  })

  const activity_suggestions = [
    { title: 'ביקור במוזיאון', category: 'activity' as const, duration: 120 },
    { title: 'טיול חוף', category: 'activity' as const, duration: 180 },
    { title: 'ארוחה במסעדה מקומית', category: 'food' as const, duration: 90 },
    { title: 'קניות בשוק', category: 'activity' as const, duration: 120 },
    { title: 'סיור עירוני', category: 'activity' as const, duration: 150 },
    { title: 'פעילות ספורט', category: 'activity' as const, duration: 90 }
  ]

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form_data.title.trim()) return

    add_activity({
      vacation_id,
      day: selected_day,
      ...form_data
    })

    set_form_data({
      title: '',
      description: '',
      location: '',
      start_time: '',
      end_time: '',
      cost: 0,
      category: 'activity',
      notes: ''
    })
  }

  const handle_suggestion_click = (suggestion: typeof activity_suggestions[0]) => {
    set_form_data({
      ...form_data,
      title: suggestion.title,
      category: suggestion.category
    })
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          הוספת פעילות ליום {selected_day}
        </h3>
        <button
          onClick={on_close}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Activity Suggestions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">הצעות פעילויות</h4>
          <div className="grid grid-cols-1 gap-2">
            {activity_suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handle_suggestion_click(suggestion)}
                className="text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">{suggestion.title}</div>
                <div className="text-sm text-gray-500">{suggestion.duration} דקות</div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Form */}
        <form onSubmit={handle_submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם הפעילות *
            </label>
            <input
              type="text"
              value={form_data.title}
              onChange={(e) => set_form_data({ ...form_data, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              placeholder="לדוגמה: ביקור בכותל המערבי"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תיאור
            </label>
            <textarea
              value={form_data.description}
              onChange={(e) => set_form_data({ ...form_data, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right h-20 resize-none"
              placeholder="תיאור קצר של הפעילות"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              מיקום
            </label>
            <input
              type="text"
              value={form_data.location}
              onChange={(e) => set_form_data({ ...form_data, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              placeholder="כתובת או שם המקום"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שעת התחלה
              </label>
              <input
                type="time"
                value={form_data.start_time}
                onChange={(e) => set_form_data({ ...form_data, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שעת סיום
              </label>
              <input
                type="time"
                value={form_data.end_time}
                onChange={(e) => set_form_data({ ...form_data, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              קטגוריה
            </label>
            <select
              value={form_data.category}
              onChange={(e) => set_form_data({ ...form_data, category: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            >
              <option value="activity">פעילות</option>
              <option value="food">אוכל</option>
              <option value="accommodation">לינה</option>
              <option value="transport">תחבורה</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              עלות (₪)
            </label>
            <input
              type="number"
              value={form_data.cost}
              onChange={(e) => set_form_data({ ...form_data, cost: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              min="0"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              הערות
            </label>
            <textarea
              value={form_data.notes}
              onChange={(e) => set_form_data({ ...form_data, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right h-16 resize-none"
              placeholder="הערות נוספות"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            הוסף פעילות
          </button>
        </form>
      </div>
    </div>
  )
}