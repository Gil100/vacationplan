import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface UserPreferences {
  // Display preferences
  theme: 'light' | 'dark' | 'auto'
  language: 'he' | 'en'
  currency: 'NIS' | 'USD' | 'EUR'
  timezone: string
  
  // Planning preferences
  default_vacation_duration: number // days
  default_daily_budget: number
  kosher_only: boolean
  shabbat_observant: boolean
  accessibility_needs: boolean
  
  // Notification preferences
  enable_notifications: boolean
  backup_reminders: boolean
  planning_tips: boolean
  
  // Privacy preferences
  allow_analytics: boolean
  share_usage_data: boolean
  
  // Customization
  favorite_destinations: string[]
  preferred_activity_categories: string[]
  default_activity_duration: number // minutes
  
  // User profile
  family_size: number
  children_ages: number[]
  travel_style: 'budget' | 'comfort' | 'luxury'
  planning_style: 'detailed' | 'flexible' | 'spontaneous'
}

interface UserPreferencesState {
  preferences: UserPreferences
  is_first_time_user: boolean
  last_updated: string
  onboarding_completed: boolean
}

interface UserPreferencesActions {
  update_preferences: (updates: Partial<UserPreferences>) => void
  reset_preferences: () => void
  complete_onboarding: () => void
  export_preferences: () => UserPreferences
  import_preferences: (preferences: UserPreferences) => void
}

type UserPreferencesStore = UserPreferencesState & UserPreferencesActions

const default_preferences: UserPreferences = {
  // Display
  theme: 'light',
  language: 'he',
  currency: 'NIS',
  timezone: 'Asia/Jerusalem',
  
  // Planning
  default_vacation_duration: 7,
  default_daily_budget: 300,
  kosher_only: false,
  shabbat_observant: false,
  accessibility_needs: false,
  
  // Notifications
  enable_notifications: true,
  backup_reminders: true,
  planning_tips: true,
  
  // Privacy
  allow_analytics: true,
  share_usage_data: false,
  
  // Customization
  favorite_destinations: ['תל אביב', 'ירושלים', 'אילת'],
  preferred_activity_categories: ['attraction', 'restaurant', 'nature'],
  default_activity_duration: 120,
  
  // Profile
  family_size: 2,
  children_ages: [],
  travel_style: 'comfort',
  planning_style: 'detailed'
}

export const use_user_preferences = create<UserPreferencesStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        preferences: default_preferences,
        is_first_time_user: true,
        last_updated: new Date().toISOString(),
        onboarding_completed: false,

        // Actions
        update_preferences: (updates) => {
          set((state) => ({
            preferences: { ...state.preferences, ...updates },
            last_updated: new Date().toISOString(),
            is_first_time_user: false
          }))
        },

        reset_preferences: () => {
          set({
            preferences: default_preferences,
            last_updated: new Date().toISOString(),
            is_first_time_user: true,
            onboarding_completed: false
          })
        },

        complete_onboarding: () => {
          set({
            onboarding_completed: true,
            is_first_time_user: false,
            last_updated: new Date().toISOString()
          })
        },

        export_preferences: () => {
          return get().preferences
        },

        import_preferences: (preferences) => {
          set({
            preferences,
            last_updated: new Date().toISOString(),
            is_first_time_user: false
          })
        }
      }),
      {
        name: 'user_preferences',
        partialize: (state) => ({
          preferences: state.preferences,
          is_first_time_user: state.is_first_time_user,
          last_updated: state.last_updated,
          onboarding_completed: state.onboarding_completed
        })
      }
    ),
    { name: 'user-preferences-store' }
  )
)

// Derived selectors
export const use_display_preferences = () => {
  const { preferences } = use_user_preferences()
  return {
    theme: preferences.theme,
    language: preferences.language,
    currency: preferences.currency,
    timezone: preferences.timezone
  }
}

export const use_planning_preferences = () => {
  const { preferences } = use_user_preferences()
  return {
    default_vacation_duration: preferences.default_vacation_duration,
    default_daily_budget: preferences.default_daily_budget,
    kosher_only: preferences.kosher_only,
    shabbat_observant: preferences.shabbat_observant,
    accessibility_needs: preferences.accessibility_needs,
    favorite_destinations: preferences.favorite_destinations,
    preferred_activity_categories: preferences.preferred_activity_categories,
    default_activity_duration: preferences.default_activity_duration
  }
}

export const use_user_profile = () => {
  const { preferences } = use_user_preferences()
  return {
    family_size: preferences.family_size,
    children_ages: preferences.children_ages,
    travel_style: preferences.travel_style,
    planning_style: preferences.planning_style
  }
}

export const use_notification_preferences = () => {
  const { preferences } = use_user_preferences()
  return {
    enable_notifications: preferences.enable_notifications,
    backup_reminders: preferences.backup_reminders,
    planning_tips: preferences.planning_tips
  }
}

// Helper hooks
export const use_is_kosher_user = () => {
  const { kosher_only } = use_planning_preferences()
  return kosher_only
}

export const use_is_shabbat_observant = () => {
  const { shabbat_observant } = use_planning_preferences()
  return shabbat_observant
}

export const use_currency_symbol = () => {
  const { currency } = use_display_preferences()
  const symbols = { NIS: '₪', USD: '$', EUR: '€' }
  return symbols[currency]
}