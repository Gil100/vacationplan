import React from 'react'
import { Button } from '../ui'

interface EmptyStateProps {
  on_create_vacation?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ on_create_vacation }) => {
  const handle_create_vacation = () => {
    if (on_create_vacation) {
      on_create_vacation()
    }
  }

  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          הזמן להתחיל לחלום!
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          עדיין לא יצרתם את החופשה הראשונה שלכם? 
          <br />
          בואו נתחיל לתכנן את הרגעים הבלתי נשכחים הבאים שלכם
        </p>

        {/* Call to Action */}
        <Button
          onClick={handle_create_vacation}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          צרו את החופשה הראשונה
        </Button>

        {/* Motivational features */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-5 h-5 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            תכנון מפורט יום אחר יום
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-5 h-5 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            יעדים מותאמים למשפחות ישראליות
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-5 h-5 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            ניהול תקציב וחישוב עלויות
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyState