import React, { useState, useMemo, Suspense, lazy } from 'react'
import { Container } from '../components/ui'
import { use_vacations, Vacation } from '../stores/vacation_store'
import { use_translation } from '../hooks/use_translation'
import VacationGrid from '../components/vacation/VacationGrid'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardStats from '../components/dashboard/DashboardStats'
import SearchAndFilter, { FilterOptions } from '../components/dashboard/SearchAndFilter'
import { ComponentLoader } from '../utils/lazy_loading'

// Lazy load the modal component since it's only needed when creating a vacation
const VacationCreateModal = lazy(() => import('../components/vacation/VacationCreateModal'))

const DashboardPage: React.FC = () => {
  const { t } = use_translation()
  const { vacations, loading, error } = use_vacations()
  const [show_create_modal, set_show_create_modal] = useState(false)
  const [view_mode, set_view_mode] = useState<'grid' | 'list'>('grid')
  const [search_query, set_search_query] = useState('')
  const [filters, set_filters] = useState<FilterOptions>({
    status: 'all',
    date_range: 'all',
    budget_range: 'all'
  })

  // Filter and search logic
  const filtered_vacations = useMemo(() => {
    let result = [...vacations]

    // Apply search filter
    if (search_query.trim()) {
      const query = search_query.toLowerCase().trim()
      result = result.filter(vacation => 
        vacation.title.toLowerCase().includes(query) ||
        vacation.destination.toLowerCase().includes(query) ||
        vacation.description?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(vacation => vacation.status === filters.status)
    }

    // Apply date range filter
    if (filters.date_range !== 'all') {
      const now = new Date()
      const current_year = now.getFullYear()
      
      result = result.filter(vacation => {
        const vacation_date = new Date(vacation.start_date)
        
        switch (filters.date_range) {
          case 'upcoming':
            return vacation_date >= now
          case 'past':
            return vacation_date < now
          case 'this_year':
            return vacation_date.getFullYear() === current_year
          default:
            return true
        }
      })
    }

    // Apply budget range filter
    if (filters.budget_range !== 'all' && filters.budget_range !== undefined) {
      result = result.filter(vacation => {
        if (!vacation.budget) return filters.budget_range === 'low'
        
        switch (filters.budget_range) {
          case 'low':
            return vacation.budget <= 5000
          case 'medium':
            return vacation.budget > 5000 && vacation.budget <= 15000
          case 'high':
            return vacation.budget > 15000
          default:
            return true
        }
      })
    }

    return result
  }, [vacations, search_query, filters])

  return (
    <div className="min-h-screen bg-gray-50 rtl:text-right">
      <Container className="py-8">
        <DashboardHeader 
          on_create_vacation={() => set_show_create_modal(true)}
          view_mode={view_mode}
          on_view_mode_change={set_view_mode}
        />
        
        <DashboardStats vacations={vacations} />

        <SearchAndFilter
          on_search={set_search_query}
          on_filter={set_filters}
          vacation_count={filtered_vacations.length}
        />

        <VacationGrid 
          vacations={filtered_vacations}
          loading={loading}
          error={error}
          view_mode={view_mode}
          on_create_vacation={() => set_show_create_modal(true)}
        />

        {show_create_modal && (
          <Suspense fallback={<ComponentLoader />}>
            <VacationCreateModal 
              on_close={() => set_show_create_modal(false)}
            />
          </Suspense>
        )}
      </Container>
    </div>
  )
}

export default DashboardPage