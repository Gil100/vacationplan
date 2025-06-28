import React, { useState, useEffect } from 'react'
import { use_activities } from '../../stores/vacation_store'
import { Location, ActivityCategory } from '../../types'
import { LocationPicker } from './LocationPicker'
import { get_category_info } from './CategoryFilter'
import { activity_template_service, ActivityTemplate } from '../../services/activity_templates'

interface ActivitySidebarProps {
  vacation_id: string
  selected_day: number
  on_close: () => void
  destination?: string
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  vacation_id,
  selected_day,
  on_close,
  destination
}) => {
  const { add_activity } = use_activities()
  const [form_data, set_form_data] = useState<{
    title: string
    description: string
    location: Location | null
    start_time: string
    end_time: string
    cost: number
    category: ActivityCategory
    notes: string
  }>({
    title: '',
    description: '',
    location: null,
    start_time: '',
    end_time: '',
    cost: 0,
    category: ActivityCategory.ATTRACTION,
    notes: ''
  })

  const [suggested_templates, set_suggested_templates] = useState<ActivityTemplate[]>([])
  const [template_search, set_template_search] = useState('')
  const [show_all_templates, set_show_all_templates] = useState(false)

  // Load suggested templates based on context
  useEffect(() => {
    const context = {
      category: form_data.category !== ActivityCategory.ATTRACTION ? form_data.category : undefined,
      time: form_data.start_time,
      location: destination
    }
    
    const templates = activity_template_service.get_suggested_templates(context)
    set_suggested_templates(templates.slice(0, 6))
  }, [form_data.category, form_data.start_time, destination])

  // Search templates when query changes
  useEffect(() => {
    if (template_search.trim()) {
      const search_results = activity_template_service.search_templates(template_search)
      set_suggested_templates(search_results.slice(0, 8))
    } else {
      const context = {
        category: form_data.category !== ActivityCategory.ATTRACTION ? form_data.category : undefined,
        time: form_data.start_time,
        location: destination
      }
      const templates = activity_template_service.get_suggested_templates(context)
      set_suggested_templates(templates.slice(0, 6))
    }
  }, [template_search, form_data.category, form_data.start_time, destination])

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form_data.title.trim()) return

    add_activity({
      vacation_id,
      day: selected_day,
      title: form_data.title,
      description: form_data.description,
      location: form_data.location?.name || '',
      start_time: form_data.start_time,
      end_time: form_data.end_time,
      cost: form_data.cost,
      category: form_data.category as any, // Convert to old category format for now
      notes: form_data.notes
    })

    set_form_data({
      title: '',
      description: '',
      location: null,
      start_time: '',
      end_time: '',
      cost: 0,
      category: ActivityCategory.ATTRACTION,
      notes: ''
    })
  }

  const handle_template_click = (template: ActivityTemplate) => {
    set_form_data({
      ...form_data,
      title: template.title,
      description: template.description,
      category: template.category,
      cost: template.estimated_cost,
      notes: template.tags.join(', ')
    })
    
    // Set suggested time if available
    if (template.suggested_times.length > 0 && !form_data.start_time) {
      const suggested_time = template.suggested_times[0]
      const [hours, minutes] = suggested_time.split(':')
      const start_time = `${hours}:${minutes}`
      
      // Calculate end time based on duration
      const start_date = new Date(`2000-01-01T${start_time}:00`)
      const end_date = new Date(start_date.getTime() + template.duration * 60000)
      const end_time = end_date.toTimeString().substring(0, 5)
      
      set_form_data(prev => ({
        ...prev,
        start_time,
        end_time
      }))
    }
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
        {/* Activity Templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => set_show_all_templates(!show_all_templates)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {show_all_templates ? 'הצג פחות' : 'הצג עוד'}
            </button>
            <h4 className="text-sm font-medium text-gray-900">תבניות פעילויות</h4>
          </div>
          
          {/* Template search */}
          <div className="mb-3">
            <input
              type="text"
              value={template_search}
              onChange={(e) => set_template_search(e.target.value)}
              placeholder="חפש תבנית פעילות..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-right"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {(show_all_templates 
              ? activity_template_service.get_all_templates() 
              : suggested_templates
            ).map((template, index) => {
              const category_info = get_category_info(template.category)
              return (
                <button
                  key={template.id}
                  onClick={() => handle_template_click(template)}
                  className="text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${category_info.color}`}>
                        {category_info.label}
                      </span>
                      {template.estimated_cost === 0 && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          חינם
                        </span>
                      )}
                      {template.is_kosher_friendly && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          כשר
                        </span>
                      )}
                    </div>
                    <span className="text-lg">{template.icon}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 mb-1">{template.title}</div>
                    <div className="text-xs text-gray-500 mb-1">{template.description}</div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>₪{template.estimated_cost}</span>
                      <span>{template.duration} דקות</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {suggested_templates.length === 0 && template_search && (
            <div className="text-center text-gray-500 text-sm py-4">
              לא נמצאו תבניות עבור "{template_search}"
            </div>
          )}
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
            <LocationPicker
              value={form_data.location}
              onChange={(location) => set_form_data({ ...form_data, location })}
              placeholder="חפש מיקום או הזן כתובת"
              activity_category={form_data.category}
              destination={destination}
              show_suggestions={true}
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
              onChange={(e) => set_form_data({ ...form_data, category: e.target.value as ActivityCategory })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            >
              {Object.values(ActivityCategory).map((category) => {
                const category_info = get_category_info(category)
                return (
                  <option key={category} value={category}>
                    {category_info.icon} {category_info.label}
                  </option>
                )
              })}
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