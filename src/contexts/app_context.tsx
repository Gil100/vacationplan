import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// App state interface
interface AppState {
  theme: 'light' | 'dark'
  language: 'he' | 'en'
  rtl: boolean
  loading: boolean
  error: string | null
  user_preferences: {
    currency: 'ILS' | 'USD' | 'EUR'
    date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY'
    notifications: boolean
  }
}

// Action types
type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'he' | 'en' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppState['user_preferences']> }

// Initial state
const initial_state: AppState = {
  theme: 'light',
  language: 'he',
  rtl: true,
  loading: false,
  error: null,
  user_preferences: {
    currency: 'ILS',
    date_format: 'DD/MM/YYYY',
    notifications: true,
  },
}

// Reducer function
const app_reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    
    case 'SET_LANGUAGE':
      return { 
        ...state, 
        language: action.payload,
        rtl: action.payload === 'he'
      }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        user_preferences: { ...state.user_preferences, ...action.payload }
      }
    
    default:
      return state
  }
}

// Context interface
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  actions: {
    set_theme: (theme: 'light' | 'dark') => void
    set_language: (language: 'he' | 'en') => void
    set_loading: (loading: boolean) => void
    set_error: (error: string | null) => void
    clear_error: () => void
    update_preferences: (preferences: Partial<AppState['user_preferences']>) => void
  }
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(app_reducer, initial_state)
  
  // Action creators
  const actions = {
    set_theme: (theme: 'light' | 'dark') => {
      dispatch({ type: 'SET_THEME', payload: theme })
    },
    
    set_language: (language: 'he' | 'en') => {
      dispatch({ type: 'SET_LANGUAGE', payload: language })
    },
    
    set_loading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading })
    },
    
    set_error: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error })
    },
    
    clear_error: () => {
      dispatch({ type: 'CLEAR_ERROR' })
    },
    
    update_preferences: (preferences: Partial<AppState['user_preferences']>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
    },
  }
  
  const value: AppContextType = {
    state,
    dispatch,
    actions,
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export const use_app_context = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('use_app_context must be used within an AppProvider')
  }
  return context
}

// Convenience hooks
export const use_theme = () => {
  const { state, actions } = use_app_context()
  return {
    theme: state.theme,
    set_theme: actions.set_theme,
  }
}

export const use_language = () => {
  const { state, actions } = use_app_context()
  return {
    language: state.language,
    rtl: state.rtl,
    set_language: actions.set_language,
  }
}

export const use_loading = () => {
  const { state, actions } = use_app_context()
  return {
    loading: state.loading,
    set_loading: actions.set_loading,
  }
}

export const use_error = () => {
  const { state, actions } = use_app_context()
  return {
    error: state.error,
    set_error: actions.set_error,
    clear_error: actions.clear_error,
  }
}

export const use_preferences = () => {
  const { state, actions } = use_app_context()
  return {
    preferences: state.user_preferences,
    update_preferences: actions.update_preferences,
  }
}