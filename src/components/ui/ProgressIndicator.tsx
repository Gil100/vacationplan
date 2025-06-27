import React from 'react'
import { Vacation } from '../../stores/vacation_store'

interface ProgressIndicatorProps {
  status: Vacation['status']
  className?: string
  show_label?: boolean
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  status, 
  className = '',
  show_label = true
}) => {
  const progress_steps = [
    { key: 'draft', label: 'טיוטה', completed: false },
    { key: 'planning', label: 'תכנון', completed: false },
    { key: 'confirmed', label: 'מאושר', completed: false },
    { key: 'completed', label: 'הושלם', completed: false }
  ]

  // Mark steps as completed based on current status
  const status_order = ['draft', 'planning', 'confirmed', 'completed']
  const current_index = status_order.indexOf(status)
  
  progress_steps.forEach((step, index) => {
    step.completed = index <= current_index
  })

  const get_progress_percentage = () => {
    return ((current_index + 1) / status_order.length) * 100
  }

  const get_step_color = (step: typeof progress_steps[0], index: number) => {
    if (step.completed) {
      return 'bg-green-500 text-white'
    } else if (index === current_index + 1) {
      return 'bg-blue-100 text-blue-600 border-2 border-blue-500'
    } else {
      return 'bg-gray-200 text-gray-500'
    }
  }

  return (
    <div className={`${className}`}>
      {show_label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            התקדמות תכנון
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(get_progress_percentage())}%
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
        <div 
          className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${get_progress_percentage()}%` }}
        ></div>
      </div>

      {/* Steps */}
      <div className="flex justify-between">
        {progress_steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
              ${get_step_color(step, index)}
            `}>
              {step.completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={`
              text-xs mt-1 font-medium text-center
              ${step.completed ? 'text-green-600' : 'text-gray-500'}
            `}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressIndicator