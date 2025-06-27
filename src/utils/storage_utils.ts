// Local storage utilities with error handling

export const get_from_storage = <T>(key: string, default_value: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : default_value
  } catch (error) {
    console.warn(`Error reading from localStorage for key '${key}':`, error)
    return default_value
  }
}

export const set_to_storage = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Error writing to localStorage for key '${key}':`, error)
    return false
  }
}

export const remove_from_storage = (key: string): boolean => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Error removing from localStorage for key '${key}':`, error)
    return false
  }
}

export const clear_storage = (): boolean => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.warn('Error clearing localStorage:', error)
    return false
  }
}

export const get_storage_size = (): number => {
  try {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  } catch (error) {
    console.warn('Error calculating localStorage size:', error)
    return 0
  }
}

// Session storage utilities
export const get_from_session_storage = <T>(key: string, default_value: T): T => {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : default_value
  } catch (error) {
    console.warn(`Error reading from sessionStorage for key '${key}':`, error)
    return default_value
  }
}

export const set_to_session_storage = <T>(key: string, value: T): boolean => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Error writing to sessionStorage for key '${key}':`, error)
    return false
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  VACATION_PREFERENCES: 'vacation_preferences',
  USER_SETTINGS: 'user_settings',
  DRAFT_VACATION: 'draft_vacation',
  RECENT_SEARCHES: 'recent_searches',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// Typed storage functions for specific data
export interface UserPreferences {
  currency: 'ILS' | 'USD' | 'EUR'
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY'
  notifications: boolean
  auto_save: boolean
}

export const get_user_preferences = (): UserPreferences => {
  return get_from_storage<UserPreferences>(STORAGE_KEYS.USER_SETTINGS, {
    currency: 'ILS',
    date_format: 'DD/MM/YYYY',
    notifications: true,
    auto_save: true,
  })
}

export const set_user_preferences = (preferences: Partial<UserPreferences>): boolean => {
  const current = get_user_preferences()
  const updated = { ...current, ...preferences }
  return set_to_storage(STORAGE_KEYS.USER_SETTINGS, updated)
}