import React, { useState } from 'react'
import { use_activities } from '../../stores/vacation_store'

interface AddActivityButtonProps {
  vacation_id: string
  day: number
  variant?: 'primary' | 'secondary'
  suggested_time?: string
}

export const AddActivityButton: React.FC<AddActivityButtonProps> = ({
  vacation_id,
  day,
  variant = 'secondary',
  suggested_time
}) => {
  const { add_activity } = use_activities()
  const [show_quick_add, set_show_quick_add] = useState(false)
  const [quick_activity, set_quick_activity] = useState({
    title: '',
    description: '',
    category: 'activity' as const,
    start_time: suggested_time || '',
    cost: 0
  })

  const activity_templates = [
    { title: 'ארוחת בוקר', category: 'food' as const, start_time: '08:00' },
    { title: 'ביקור באתר', category: 'activity' as const, start_time: '10:00' },
    { title: 'ארוחת צהריים', category: 'food' as const, start_time: '13:00' },
    { title: 'קניות', category: 'activity' as const, start_time: '15:00' },
    { title: 'ארוחת ערב', category: 'food' as const, start_time: '19:00' },
    { title: 'נסיעה', category: 'transport' as const, start_time: '09:00' }
  ]

  const handle_quick_add = () => {
    if (!quick_activity.title.trim()) return
    
    add_activity({
      vacation_id,
      day,
      ...quick_activity
    })
    
    set_quick_activity({
      title: '',
      description: '',
      category: 'activity',
      start_time: suggested_time || '',
      cost: 0
    })
    set_show_quick_add(false)
  }

  const handle_template_add = (template: typeof activity_templates[0]) => {
    add_activity({
      vacation_id,
      day,
      title: template.title,
      category: template.category,
      start_time: template.start_time,
      cost: 0
    })
  }

  const button_classes = variant === 'primary'
    ? 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
    : 'px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'

  if (show_quick_add) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">הוספת פעילות מהירה</h4>
        
        <div className="space-y-3">
          <input
            type="text"
            value={quick_activity.title}
            onChange={(e) => set_quick_activity({ ...quick_activity, title: e.target.value })}
            placeholder="שם הפעילות"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            autoFocus
          />
          
          <div className="grid grid-cols-2 gap-3">
            <select
              value={quick_activity.category}
              onChange={(e) => set_quick_activity({ ...quick_activity, category: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-md text-right"
            >
              <option value="activity">פעילות</option>
              <option value="food">אוכל</option>
              <option value="accommodation">לינה</option>
              <option value="transport">תחבורה</option>
              <option value="other">אחר</option>
            </select>
            
            <input
              type="time"
              value={quick_activity.start_time}
              onChange={(e) => set_quick_activity({ ...quick_activity, start_time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-right"
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => set_show_quick_add(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              ביטול
            </button>
            <button
              onClick={handle_quick_add}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              הוסף
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => set_show_quick_add(true)}
        className={button_classes}
      >
        <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        הוסף פעילות
      </button>

    </div>
  )
}