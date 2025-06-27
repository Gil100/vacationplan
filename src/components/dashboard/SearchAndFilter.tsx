import React, { useState } from 'react'
import { Input, Button } from '../ui'
import { Vacation } from '../../stores/vacation_store'

interface SearchAndFilterProps {
  on_search: (query: string) => void
  on_filter: (filters: FilterOptions) => void
  vacation_count: number
}

export interface FilterOptions {
  status: Vacation['status'] | 'all'
  date_range: 'all' | 'upcoming' | 'past' | 'this_year'
  budget_range: 'all' | 'low' | 'medium' | 'high'
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  on_search,
  on_filter,
  vacation_count
}) => {
  const [search_query, set_search_query] = useState('')
  const [show_filters, set_show_filters] = useState(false)
  const [filters, set_filters] = useState<FilterOptions>({
    status: 'all',
    date_range: 'all',
    budget_range: 'all'
  })

  const handle_search = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    set_search_query(query)
    on_search(query)
  }

  const handle_filter_change = (key: keyof FilterOptions, value: string) => {
    const new_filters = { ...filters, [key]: value }
    set_filters(new_filters)
    on_filter(new_filters)
  }

  const clear_filters = () => {
    const default_filters: FilterOptions = {
      status: 'all',
      date_range: 'all',
      budget_range: 'all'
    }
    set_filters(default_filters)
    on_filter(default_filters)
  }

  const has_active_filters = filters.status !== 'all' || filters.date_range !== 'all' || filters.budget_range !== 'all'

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              value={search_query}
              onChange={handle_search}
              placeholder="חפשו לפי שם חופשה או יעד..."
              className="pr-10"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {vacation_count} חופשות
          </span>
          <Button
            variant="outline"
            onClick={() => set_show_filters(!show_filters)}
            className={`relative ${has_active_filters ? 'ring-2 ring-blue-500' : ''}`}
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            סינון
            {has_active_filters && (
              <span className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full"></span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {show_filters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סטטוס
              </label>
              <select
                value={filters.status}
                onChange={(e) => handle_filter_change('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="draft">טיוטה</option>
                <option value="planning">בתכנון</option>
                <option value="confirmed">מאושר</option>
                <option value="completed">הושלם</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טווח תאריכים
              </label>
              <select
                value={filters.date_range}
                onChange={(e) => handle_filter_change('date_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל התאריכים</option>
                <option value="upcoming">חופשות עתידיות</option>
                <option value="past">חופשות שעברו</option>
                <option value="this_year">השנה</option>
              </select>
            </div>

            {/* Budget Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טווח תקציב
              </label>
              <select
                value={filters.budget_range}
                onChange={(e) => handle_filter_change('budget_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל התקציבים</option>
                <option value="low">עד 5,000 ₪</option>
                <option value="medium">5,000 - 15,000 ₪</option>
                <option value="high">מעל 15,000 ₪</option>
              </select>
            </div>
          </div>

          {has_active_filters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clear_filters}
                className="text-sm"
              >
                נקה סינונים
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchAndFilter