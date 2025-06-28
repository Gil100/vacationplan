import React from 'react'
import { ActivityCategory } from '../../types'
import { use_translation } from '../../hooks/use_translation'
import { Button } from '../ui/Button'

interface CategoryFilterProps {
  selected_categories: ActivityCategory[]
  onChange: (categories: ActivityCategory[]) => void
  show_all_option?: boolean
  className?: string
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selected_categories,
  onChange,
  show_all_option = true,
  className = ''
}) => {
  const { t } = use_translation()

  const categories = [
    { value: ActivityCategory.ATTRACTION, label: 'אטרקציות', icon: '🏛️', color: 'bg-blue-100 text-blue-700' },
    { value: ActivityCategory.RESTAURANT, label: 'מסעדות', icon: '🍽️', color: 'bg-green-100 text-green-700' },
    { value: ActivityCategory.ACCOMMODATION, label: 'לינה', icon: '🏨', color: 'bg-purple-100 text-purple-700' },
    { value: ActivityCategory.TRANSPORTATION, label: 'תחבורה', icon: '🚗', color: 'bg-orange-100 text-orange-700' },
    { value: ActivityCategory.SHOPPING, label: 'קניות', icon: '🛒', color: 'bg-pink-100 text-pink-700' },
    { value: ActivityCategory.ENTERTAINMENT, label: 'בידור', icon: '🎭', color: 'bg-indigo-100 text-indigo-700' },
    { value: ActivityCategory.NATURE, label: 'טבע', icon: '🌳', color: 'bg-emerald-100 text-emerald-700' },
    { value: ActivityCategory.CULTURE, label: 'תרבות', icon: '🎨', color: 'bg-amber-100 text-amber-700' },
    { value: ActivityCategory.SPORTS, label: 'ספורט', icon: '⚽', color: 'bg-red-100 text-red-700' },
    { value: ActivityCategory.RELAXATION, label: 'רגיעה', icon: '🧘', color: 'bg-teal-100 text-teal-700' }
  ]

  const handle_category_toggle = (category: ActivityCategory) => {
    if (selected_categories.includes(category)) {
      onChange(selected_categories.filter(c => c !== category))
    } else {
      onChange([...selected_categories, category])
    }
  }

  const handle_select_all = () => {
    if (selected_categories.length === categories.length) {
      onChange([]) // Deselect all
    } else {
      onChange(categories.map(cat => cat.value)) // Select all
    }
  }

  const is_all_selected = selected_categories.length === categories.length
  const is_none_selected = selected_categories.length === 0

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with select all option */}
      {show_all_option && (
        <div className="flex items-center justify-between">
          <Button
            variant={is_all_selected ? 'primary' : 'outline'}
            size="sm"
            onClick={handle_select_all}
            className="text-sm"
          >
            {is_all_selected ? 'בטל הכל' : 'בחר הכל'}
          </Button>
          <h3 className="text-sm font-medium text-gray-700">
            סינון לפי קטגוריה
          </h3>
        </div>
      )}

      {/* Category buttons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {categories.map((category) => {
          const is_selected = selected_categories.includes(category.value)
          
          return (
            <button
              key={category.value}
              onClick={() => handle_category_toggle(category.value)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                ${is_selected 
                  ? `${category.color} border-current shadow-md` 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {category.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selection summary */}
      <div className="text-xs text-gray-500 text-center">
        {is_none_selected 
          ? 'לא נבחרו קטגוריות'
          : is_all_selected 
            ? 'כל הקטגוריות נבחרו'
            : `${selected_categories.length} מתוך ${categories.length} קטגוריות נבחרו`
        }
      </div>
    </div>
  )
}

// Helper function to get category info
export const get_category_info = (category: ActivityCategory) => {
  const category_map = {
    [ActivityCategory.ATTRACTION]: { label: 'אטרקציות', icon: '🏛️', color: 'bg-blue-100 text-blue-700' },
    [ActivityCategory.RESTAURANT]: { label: 'מסעדות', icon: '🍽️', color: 'bg-green-100 text-green-700' },
    [ActivityCategory.ACCOMMODATION]: { label: 'לינה', icon: '🏨', color: 'bg-purple-100 text-purple-700' },
    [ActivityCategory.TRANSPORTATION]: { label: 'תחבורה', icon: '🚗', color: 'bg-orange-100 text-orange-700' },
    [ActivityCategory.SHOPPING]: { label: 'קניות', icon: '🛒', color: 'bg-pink-100 text-pink-700' },
    [ActivityCategory.ENTERTAINMENT]: { label: 'בידור', icon: '🎭', color: 'bg-indigo-100 text-indigo-700' },
    [ActivityCategory.NATURE]: { label: 'טבע', icon: '🌳', color: 'bg-emerald-100 text-emerald-700' },
    [ActivityCategory.CULTURE]: { label: 'תרבות', icon: '🎨', color: 'bg-amber-100 text-amber-700' },
    [ActivityCategory.SPORTS]: { label: 'ספורט', icon: '⚽', color: 'bg-red-100 text-red-700' },
    [ActivityCategory.RELAXATION]: { label: 'רגיעה', icon: '🧘', color: 'bg-teal-100 text-teal-700' }
  }
  
  return category_map[category] || { label: category, icon: '📍', color: 'bg-gray-100 text-gray-700' }
}