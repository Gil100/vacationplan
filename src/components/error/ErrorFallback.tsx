import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  reset_error?: () => void
  title?: string
  message?: string
  show_details?: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  reset_error,
  title = 'משהו השתבש',
  message = 'אנחנו נתקלים בבעיה בטעינת הרכיב. אנא נסו שוב.',
  show_details = false,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 hebrew-text rtl">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        
        <div className="mr-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            {title}
          </h3>
          
          <p className="text-sm text-red-700 mb-3">
            {message}
          </p>
          
          {reset_error && (
            <button
              onClick={reset_error}
              className="inline-flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              נסה שוב
            </button>
          )}
          
          {show_details && error && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                פרטי שגיאה
              </summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800 font-mono">
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback