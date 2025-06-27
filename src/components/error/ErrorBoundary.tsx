import React, { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  has_error: boolean
  error: Error | null
  error_info: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      has_error: false,
      error: null,
      error_info: null,
    }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return {
      has_error: true,
      error,
      error_info: null,
    }
  }
  
  componentDidCatch(error: Error, error_info: ErrorInfo) {
    this.setState({
      error,
      error_info,
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, error_info)
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, error_info)
    }
    
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error)
  }
  
  handle_reset = () => {
    this.setState({
      has_error: false,
      error: null,
      error_info: null,
    })
  }
  
  handle_reload = () => {
    window.location.reload()
  }
  
  handle_home = () => {
    window.location.href = '/'
  }
  
  render() {
    if (this.state.has_error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 rtl">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center hebrew-text">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              אופס! משהו השתבש
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              אירעה שגיאה לא צפויה. אנחנו מתנצלים על אי הנוחות ועובדים על פתרון הבעיה.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handle_reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                נסה שוב
              </button>
              
              <button
                onClick={this.handle_reload}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                רענן את הדף
              </button>
              
              <button
                onClick={this.handle_home}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                חזור לעמוד הבית
              </button>
            </div>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  פרטי שגיאה (למפתחים)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.error_info && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error_info.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

export default ErrorBoundary