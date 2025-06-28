import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { VacationActivity } from './vacation_store'
import { ActivityTemplate } from '../services/activity_templates'
import { Location } from '../types'

export interface FavoriteActivity {
  id: string
  activity_data: Omit<VacationActivity, 'id' | 'vacation_id'>
  original_vacation_id?: string
  original_vacation_title?: string
  added_at: string
  tags: string[]
  notes: string
  usage_count: number
}

export interface FavoriteLocation {
  id: string
  location: Location
  added_at: string
  tags: string[]
  notes: string
  usage_count: number
}

export interface RecentVacation {
  vacation_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  last_accessed: string
  activity_count: number
  total_cost: number
}

interface FavoritesState {
  favorite_activities: FavoriteActivity[]
  favorite_locations: FavoriteLocation[]
  recent_vacations: RecentVacation[]
  loading: boolean
  error: string | null
}

interface FavoritesActions {
  // Favorite Activities
  add_favorite_activity: (
    activity: VacationActivity, 
    vacation_title?: string,
    tags?: string[],
    notes?: string
  ) => void
  remove_favorite_activity: (favorite_id: string) => void
  update_favorite_activity: (favorite_id: string, updates: Partial<FavoriteActivity>) => void
  increment_activity_usage: (favorite_id: string) => void
  
  // Favorite Locations
  add_favorite_location: (location: Location, tags?: string[], notes?: string) => void
  remove_favorite_location: (favorite_id: string) => void
  update_favorite_location: (favorite_id: string, updates: Partial<FavoriteLocation>) => void
  increment_location_usage: (favorite_id: string) => void
  
  // Recent Vacations
  add_recent_vacation: (vacation: RecentVacation) => void
  update_recent_vacation: (vacation_id: string, updates: Partial<RecentVacation>) => void
  remove_recent_vacation: (vacation_id: string) => void
  clear_recent_vacations: () => void
  
  // Search and Filters
  search_favorite_activities: (query: string) => FavoriteActivity[]
  search_favorite_locations: (query: string) => FavoriteLocation[]
  get_activities_by_category: (category: string) => FavoriteActivity[]
  get_activities_by_tags: (tags: string[]) => FavoriteActivity[]
  get_most_used_activities: (limit?: number) => FavoriteActivity[]
  get_most_used_locations: (limit?: number) => FavoriteLocation[]
  
  // Utility
  export_favorites: () => { activities: FavoriteActivity[]; locations: FavoriteLocation[] }
  import_favorites: (data: { activities: FavoriteActivity[]; locations: FavoriteLocation[] }) => void
  set_loading: (loading: boolean) => void
  set_error: (error: string | null) => void
}

type FavoritesStore = FavoritesState & FavoritesActions

const generate_id = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const MAX_RECENT_VACATIONS = 10

export const use_favorites = create<FavoritesStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        favorite_activities: [],
        favorite_locations: [],
        recent_vacations: [],
        loading: false,
        error: null,

        // Favorite Activities
        add_favorite_activity: (activity, vacation_title, tags = [], notes = '') => {
          const new_favorite: FavoriteActivity = {
            id: generate_id(),
            activity_data: {
              day: activity.day,
              title: activity.title,
              description: activity.description,
              location: activity.location,
              start_time: activity.start_time,
              end_time: activity.end_time,
              cost: activity.cost,
              category: activity.category,
              notes: activity.notes
            },
            original_vacation_id: activity.vacation_id,
            original_vacation_title: vacation_title,
            added_at: new Date().toISOString(),
            tags,
            notes,
            usage_count: 0
          }

          set(state => ({
            favorite_activities: [...state.favorite_activities, new_favorite]
          }))
        },

        remove_favorite_activity: (favorite_id) => {
          set(state => ({
            favorite_activities: state.favorite_activities.filter(f => f.id !== favorite_id)
          }))
        },

        update_favorite_activity: (favorite_id, updates) => {
          set(state => ({
            favorite_activities: state.favorite_activities.map(f =>
              f.id === favorite_id ? { ...f, ...updates } : f
            )
          }))
        },

        increment_activity_usage: (favorite_id) => {
          set(state => ({
            favorite_activities: state.favorite_activities.map(f =>
              f.id === favorite_id ? { ...f, usage_count: f.usage_count + 1 } : f
            )
          }))
        },

        // Favorite Locations
        add_favorite_location: (location, tags = [], notes = '') => {
          // Check if location already exists
          const existing = get().favorite_locations.find(f => f.location.id === location.id)
          if (existing) {
            get().increment_location_usage(existing.id)
            return
          }

          const new_favorite: FavoriteLocation = {
            id: generate_id(),
            location,
            added_at: new Date().toISOString(),
            tags,
            notes,
            usage_count: 0
          }

          set(state => ({
            favorite_locations: [...state.favorite_locations, new_favorite]
          }))
        },

        remove_favorite_location: (favorite_id) => {
          set(state => ({
            favorite_locations: state.favorite_locations.filter(f => f.id !== favorite_id)
          }))
        },

        update_favorite_location: (favorite_id, updates) => {
          set(state => ({
            favorite_locations: state.favorite_locations.map(f =>
              f.id === favorite_id ? { ...f, ...updates } : f
            )
          }))
        },

        increment_location_usage: (favorite_id) => {
          set(state => ({
            favorite_locations: state.favorite_locations.map(f =>
              f.id === favorite_id ? { ...f, usage_count: f.usage_count + 1 } : f
            )
          }))
        },

        // Recent Vacations
        add_recent_vacation: (vacation) => {
          set(state => {
            // Remove existing entry if it exists
            const filtered = state.recent_vacations.filter(r => r.vacation_id !== vacation.vacation_id)
            
            // Add new entry at the beginning
            const updated = [vacation, ...filtered]
            
            // Keep only the most recent entries
            return {
              recent_vacations: updated.slice(0, MAX_RECENT_VACATIONS)
            }
          })
        },

        update_recent_vacation: (vacation_id, updates) => {
          set(state => ({
            recent_vacations: state.recent_vacations.map(r =>
              r.vacation_id === vacation_id ? { ...r, ...updates } : r
            )
          }))
        },

        remove_recent_vacation: (vacation_id) => {
          set(state => ({
            recent_vacations: state.recent_vacations.filter(r => r.vacation_id !== vacation_id)
          }))
        },

        clear_recent_vacations: () => {
          set({ recent_vacations: [] })
        },

        // Search and Filters
        search_favorite_activities: (query) => {
          const query_lower = query.toLowerCase()
          return get().favorite_activities.filter(f =>
            f.activity_data.title.toLowerCase().includes(query_lower) ||
            f.activity_data.description?.toLowerCase().includes(query_lower) ||
            f.activity_data.location?.toLowerCase().includes(query_lower) ||
            f.tags.some(tag => tag.toLowerCase().includes(query_lower)) ||
            f.notes.toLowerCase().includes(query_lower)
          )
        },

        search_favorite_locations: (query) => {
          const query_lower = query.toLowerCase()
          return get().favorite_locations.filter(f =>
            f.location.name.toLowerCase().includes(query_lower) ||
            f.location.address.toLowerCase().includes(query_lower) ||
            f.tags.some(tag => tag.toLowerCase().includes(query_lower)) ||
            f.notes.toLowerCase().includes(query_lower)
          )
        },

        get_activities_by_category: (category) => {
          return get().favorite_activities.filter(f => f.activity_data.category === category)
        },

        get_activities_by_tags: (tags) => {
          return get().favorite_activities.filter(f =>
            tags.some(tag => f.tags.includes(tag))
          )
        },

        get_most_used_activities: (limit = 5) => {
          return get().favorite_activities
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, limit)
        },

        get_most_used_locations: (limit = 5) => {
          return get().favorite_locations
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, limit)
        },

        // Utility
        export_favorites: () => {
          const state = get()
          return {
            activities: state.favorite_activities,
            locations: state.favorite_locations
          }
        },

        import_favorites: (data) => {
          set(state => ({
            favorite_activities: [...state.favorite_activities, ...data.activities],
            favorite_locations: [...state.favorite_locations, ...data.locations]
          }))
        },

        set_loading: (loading) => set({ loading }),
        set_error: (error) => set({ error })
      }),
      {
        name: 'favorites_store',
        partialize: (state) => ({
          favorite_activities: state.favorite_activities,
          favorite_locations: state.favorite_locations,
          recent_vacations: state.recent_vacations
        })
      }
    ),
    { name: 'favorites-store' }
  )
)

// Derived hooks for easier usage
export const use_favorite_activities = () => {
  const { favorite_activities, add_favorite_activity, remove_favorite_activity } = use_favorites()
  return { favorite_activities, add_favorite_activity, remove_favorite_activity }
}

export const use_favorite_locations = () => {
  const { favorite_locations, add_favorite_location, remove_favorite_location } = use_favorites()
  return { favorite_locations, add_favorite_location, remove_favorite_location }
}

export const use_recent_vacations = () => {
  const { recent_vacations, add_recent_vacation, remove_recent_vacation } = use_favorites()
  return { recent_vacations, add_recent_vacation, remove_recent_vacation }
}