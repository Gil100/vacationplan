import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './contexts/app_context'
import ErrorBoundary from './components/error/ErrorBoundary'
import Layout from './components/layout/Layout'
import { initialize_performance_monitoring } from './utils/performance'

// Lazy load page components for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PlannerPage = lazy(() => import('./pages/PlannerPage'))

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600 hebrew-text">טוען...</p>
    </div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime in v4)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors, but retry on network errors
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

function App() {
  useEffect(() => {
    initialize_performance_monitoring()
  }, [])
  
  return (
    <ErrorBoundary>
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          <Router basename="/vacationplan">
            <Layout>
              <ErrorBoundary fallback={<div className="p-4 text-center hebrew-text">שגיאה בטעינת העמוד</div>}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/planner" element={<PlannerPage />} />
                    <Route path="/planner/:vacationId" element={<PlannerPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </Router>
        </QueryClientProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App