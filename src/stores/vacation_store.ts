import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Vacation {
  id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  participants: number
  budget?: number
  description?: string
  status: 'draft' | 'planning' | 'confirmed' | 'completed'
}

export interface VacationActivity {
  id: string
  vacation_id: string
  day: number
  title: string
  description?: string
  location?: string
  start_time?: string
  end_time?: string
  cost?: number
  category: 'accommodation' | 'food' | 'activity' | 'transport' | 'other'
  notes?: string
}

interface VacationState {
  vacations: Vacation[]
  activities: VacationActivity[]
  current_vacation: Vacation | null
  loading: boolean
  error: string | null
}

interface VacationActions {
  // Vacation CRUD
  add_vacation: (vacation: Omit<Vacation, 'id' | 'created_at' | 'updated_at'>) => void
  update_vacation: (id: string, updates: Partial<Vacation>) => void
  delete_vacation: (id: string) => void
  set_current_vacation: (vacation: Vacation | null) => void
  
  // Activity CRUD
  add_activity: (activity: Omit<VacationActivity, 'id'>) => void
  update_activity: (id: string, updates: Partial<VacationActivity>) => void
  delete_activity: (id: string) => void
  get_vacation_activities: (vacation_id: string) => VacationActivity[]
  
  // Utility actions
  set_loading: (loading: boolean) => void
  set_error: (error: string | null) => void
  clear_error: () => void
}

type VacationStore = VacationState & VacationActions

const generate_id = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const use_vacation_store = create<VacationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        vacations: [],
        activities: [],
        current_vacation: null,
        loading: false,
        error: null,
        
        // Vacation actions
        add_vacation: (vacation_data) => {
          const new_vacation: Vacation = {
            ...vacation_data,
            id: generate_id(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          set((state) => ({
            vacations: [...state.vacations, new_vacation],
          }))
        },
        
        update_vacation: (id, updates) => {
          set((state) => ({
            vacations: state.vacations.map((vacation) =>
              vacation.id === id
                ? { ...vacation, ...updates, updated_at: new Date().toISOString() }
                : vacation
            ),
            current_vacation:
              state.current_vacation?.id === id
                ? { ...state.current_vacation, ...updates, updated_at: new Date().toISOString() }
                : state.current_vacation,
          }))
        },
        
        delete_vacation: (id) => {
          set((state) => ({
            vacations: state.vacations.filter((vacation) => vacation.id !== id),
            activities: state.activities.filter((activity) => activity.vacation_id !== id),
            current_vacation: state.current_vacation?.id === id ? null : state.current_vacation,
          }))
        },
        
        set_current_vacation: (vacation) => {
          set({ current_vacation: vacation })
        },
        
        // Activity actions
        add_activity: (activity_data) => {
          const new_activity: VacationActivity = {
            ...activity_data,
            id: generate_id(),
          }
          
          set((state) => ({
            activities: [...state.activities, new_activity],
          }))
        },
        
        update_activity: (id, updates) => {
          set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === id ? { ...activity, ...updates } : activity
            ),
          }))
        },
        
        delete_activity: (id) => {
          set((state) => ({
            activities: state.activities.filter((activity) => activity.id !== id),
          }))
        },
        
        get_vacation_activities: (vacation_id) => {
          return get().activities.filter((activity) => activity.vacation_id === vacation_id)
        },
        
        // Utility actions
        set_loading: (loading) => set({ loading }),
        set_error: (error) => set({ error }),
        clear_error: () => set({ error: null }),
      }),
      {
        name: 'vacation-storage',
        partialize: (state) => ({
          vacations: state.vacations,
          activities: state.activities,
          current_vacation: state.current_vacation,
        }),
      }
    ),
    { name: 'vacation-store' }
  )
)

// Custom hooks for easier usage
export const use_vacations = () => {
  const vacations = use_vacation_store((state) => state.vacations)
  const loading = use_vacation_store((state) => state.loading)
  const error = use_vacation_store((state) => state.error)
  const add_vacation = use_vacation_store((state) => state.add_vacation)
  const update_vacation = use_vacation_store((state) => state.update_vacation)
  const delete_vacation = use_vacation_store((state) => state.delete_vacation)
  
  return {
    vacations,
    loading,
    error,
    add_vacation,
    update_vacation,
    delete_vacation,
  }
}

export const use_current_vacation = () => {
  const current_vacation = use_vacation_store((state) => state.current_vacation)
  const set_current_vacation = use_vacation_store((state) => state.set_current_vacation)
  const all_activities = use_vacation_store((state) => state.activities)
  
  const activities = current_vacation 
    ? all_activities.filter((activity) => activity.vacation_id === current_vacation.id)
    : []
  
  return {
    current_vacation,
    set_current_vacation,
    activities,
  }
}

export const use_activities = (vacation_id?: string) => {
  const all_activities = use_vacation_store((state) => state.activities)
  const add_activity = use_vacation_store((state) => state.add_activity)
  const update_activity = use_vacation_store((state) => state.update_activity)
  const delete_activity = use_vacation_store((state) => state.delete_activity)
  
  const activities = vacation_id 
    ? all_activities.filter((activity) => activity.vacation_id === vacation_id)
    : all_activities
  
  return {
    activities,
    add_activity,
    update_activity,
    delete_activity,
  }
}