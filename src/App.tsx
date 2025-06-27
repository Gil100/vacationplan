import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './contexts/app_context'
import ErrorBoundary from './components/error/ErrorBoundary'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import PlannerPage from './pages/PlannerPage'
import { initialize_performance_monitoring } from './utils/performance'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
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
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/planner/:vacationId" element={<PlannerPage />} />
                </Routes>
              </ErrorBoundary>
            </Layout>
          </Router>
        </QueryClientProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App