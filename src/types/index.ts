// Core vacation planning types
export interface VacationPlan {
  id: string
  title: string
  description: string
  destination: string
  startDate: Date
  endDate: Date
  participants: Participant[]
  dailyItineraries: DailyItinerary[]
  budget: Budget
  settings: VacationSettings
  createdAt: Date
  updatedAt: Date
}

export interface DailyItinerary {
  id: string
  date: Date
  activities: Activity[]
  notes: string
  totalCost: number
  estimatedDuration: number
}

export interface Activity {
  id: string
  title: string
  description: string
  location: Location
  startTime: string
  duration: number // minutes
  cost: number // NIS
  category: ActivityCategory
  notes: string
  isKosher?: boolean
  isShabbatFriendly?: boolean
}

export interface Location {
  id: string
  name: string
  address: string
  coordinates: Coordinates
  type: LocationType
  amenities: string[]
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Participant {
  id: string
  name: string
  age: number
  role: 'adult' | 'child' | 'infant'
  preferences: string[]
  restrictions: string[]
}

export interface Budget {
  total: number
  currency: 'NIS' | 'USD' | 'EUR'
  categories: BudgetCategory[]
}

export interface BudgetCategory {
  name: string
  allocated: number
  spent: number
}

export interface VacationSettings {
  timezone: string
  language: 'he' | 'en'
  kosherOnly: boolean
  shabbatObservant: boolean
  accessibility: AccessibilitySettings
}

export interface AccessibilitySettings {
  wheelchairAccessible: boolean
  largeText: boolean
  highContrast: boolean
}

// Enums
export enum ActivityCategory {
  ATTRACTION = 'attraction',
  RESTAURANT = 'restaurant',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  NATURE = 'nature',
  CULTURE = 'culture',
  SPORTS = 'sports',
  RELAXATION = 'relaxation'
}

export enum LocationType {
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  ATTRACTION = 'attraction',
  BEACH = 'beach',
  PARK = 'park',
  MUSEUM = 'museum',
  SHOPPING_CENTER = 'shopping_center',
  TRANSPORTATION_HUB = 'transportation_hub'
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark'
  direction: 'rtl' | 'ltr'
  sidebarOpen: boolean
  activeDay: string | null
  draggedActivity: Activity | null
  loading: boolean
  error: string | null
}