// App constants
export const APP_NAME = 'תכנון חופשות'
export const APP_DESCRIPTION = 'מערכת תכנון חופשות מתקדמת למשפחות ישראליות'

// Default settings
export const DEFAULT_LANGUAGE = 'he'
export const DEFAULT_CURRENCY = 'NIS'
export const DEFAULT_TIMEZONE = 'Asia/Jerusalem'

// Local storage keys
export const STORAGE_KEYS = {
  VACATION_PLANS: 'vacation_plans',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// Hebrew months
export const HEBREW_MONTHS = [
  'ינואר',
  'פברואר', 
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר'
] as const

// Hebrew days of week
export const HEBREW_DAYS = [
  'ראשון',
  'שני', 
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת'
] as const

// Activity categories in Hebrew
export const ACTIVITY_CATEGORIES_HE = {
  attraction: 'אטרקציה',
  restaurant: 'מסעדה',
  accommodation: 'לינה', 
  transportation: 'תחבורה',
  shopping: 'קניות',
  entertainment: 'בידור',
  nature: 'טבע',
  culture: 'תרבות',
  sports: 'ספורט',
  relaxation: 'הרפיה'
} as const

// Common Israeli destinations
export const POPULAR_DESTINATIONS = [
  'תל אביב',
  'ירושלים',
  'חיפה',
  'אילת',
  'טבריה',
  'נצרת',
  'צפת',
  'הרצליה',
  'נתניה',
  'אשקלון'
] as const

// Responsive breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const