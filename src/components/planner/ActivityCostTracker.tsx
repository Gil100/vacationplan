import React from 'react'
import { VacationActivity } from '../../stores/vacation_store'
import { get_category_info } from './CategoryFilter'
import { format_currency } from '../../utils/currency_utils'

interface ActivityCostTrackerProps {
  activities: VacationActivity[]
  vacation_budget?: number
  className?: string
}

export const ActivityCostTracker: React.FC<ActivityCostTrackerProps> = ({
  activities,
  vacation_budget,
  className = ''
}) => {
  // Calculate totals
  const total_cost = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0)
  const activities_with_cost = activities.filter(activity => (activity.cost || 0) > 0)
  
  // Group costs by category
  const cost_by_category = activities.reduce((acc, activity) => {
    const category = activity.category
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0, activities: [] }
    }
    acc[category].count += 1
    acc[category].total += activity.cost || 0
    acc[category].activities.push(activity)
    return acc
  }, {} as Record<string, { count: number; total: number; activities: VacationActivity[] }>)

  // Group costs by day
  const cost_by_day = activities.reduce((acc, activity) => {
    const day = activity.day
    if (!acc[day]) {
      acc[day] = { count: 0, total: 0, activities: [] }
    }
    acc[day].count += 1
    acc[day].total += activity.cost || 0
    acc[day].activities.push(activity)
    return acc
  }, {} as Record<number, { count: number; total: number; activities: VacationActivity[] }>)

  const budget_percentage = vacation_budget ? (total_cost / vacation_budget) * 100 : 0
  const is_over_budget = vacation_budget && total_cost > vacation_budget

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {is_over_budget && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-lg font-semibold text-gray-900">
            {format_currency(total_cost)}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">סיכום עלויות</h3>
      </div>

      {/* Budget Progress */}
      {vacation_budget && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={is_over_budget ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {budget_percentage.toFixed(1)}% מהתקציב
            </span>
            <span className="text-gray-600">
              תקציב: {format_currency(vacation_budget)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                is_over_budget ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(budget_percentage, 100)}%` }}
            />
          </div>
          {is_over_budget && (
            <p className="text-xs text-red-600 mt-1">
              חריגה: {format_currency(total_cost - vacation_budget)}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
          <div className="text-sm text-gray-600">סה״כ פעילויות</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{activities_with_cost.length}</div>
          <div className="text-sm text-gray-600">עם עלות</div>
        </div>
      </div>

      {/* Cost by Category */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">עלויות לפי קטגוריה</h4>
        <div className="space-y-2">
          {Object.entries(cost_by_category)
            .filter(([_, data]) => data.total > 0)
            .sort(([_, a], [__, b]) => b.total - a.total)
            .map(([category, data]) => {
              const category_info = get_category_info(category as any)
              const percentage = (data.total / total_cost) * 100
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category_info.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format_currency(data.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.count} פעילויות • {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${category_info.color}`}>
                    {category_info.label}
                  </span>
                </div>
              )
            })}
        </div>
        
        {Object.values(cost_by_category).every(data => data.total === 0) && (
          <div className="text-center text-gray-500 text-sm py-2">
            לא הוגדרו עלויות לפעילויות
          </div>
        )}
      </div>

      {/* Cost by Day */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">עלויות לפי יום</h4>
        <div className="space-y-2">
          {Object.entries(cost_by_day)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, data]) => {
              const percentage = total_cost > 0 ? (data.total / total_cost) * 100 : 0
              
              return (
                <div key={day} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {format_currency(data.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.count} פעילויות • {percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">יום {day}</div>
                    {data.total > 0 && (
                      <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Average cost per day */}
      {Object.keys(cost_by_day).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600">עלות ממוצעת ליום</div>
            <div className="text-lg font-semibold text-gray-900">
              {format_currency(total_cost / Object.keys(cost_by_day).length)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}