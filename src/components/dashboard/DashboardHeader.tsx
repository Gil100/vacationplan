import React from 'react'
import { Button } from '../ui'
import { use_translation } from '../../hooks/use_translation'

interface DashboardHeaderProps {
  on_create_vacation: () => void
  view_mode: 'grid' | 'list'
  on_view_mode_change: (mode: 'grid' | 'list') => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  on_create_vacation,
  view_mode,
  on_view_mode_change
}) => {
  const { t } = use_translation()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('vacation.title')}
        </h1>
        <p className="text-gray-600">
          נהלו את כל תכניות החופשות שלכם במקום אחד
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => on_view_mode_change('grid')}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              view_mode === 'grid' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="תצוגת רשת"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => on_view_mode_change('list')}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              view_mode === 'list' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="תצוגת רשימה"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Create New Vacation Button */}
        <Button
          onClick={on_create_vacation}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('vacation.new_vacation')}
        </Button>
      </div>
    </div>
  )
}

export default DashboardHeader