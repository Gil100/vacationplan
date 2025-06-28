import { format, parse, addDays } from 'date-fns'
import { he } from 'date-fns/locale'

// Date formatting utilities for Hebrew/Israeli context
export const format_date = (date: Date | string, format_string: string = 'dd/MM/yyyy'): string => {
  const date_obj = typeof date === 'string' ? new Date(date) : date
  return format(date_obj, format_string, { locale: he })
}

export const format_date_hebrew = (date: Date | string): string => {
  const date_obj = typeof date === 'string' ? new Date(date) : date
  return format(date_obj, 'EEEE, d בMMMM yyyy', { locale: he })
}

export const format_time = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  } catch {
    return time
  }
}

export const parse_date = (date_string: string, format_string: string = 'dd/MM/yyyy'): Date => {
  return parse(date_string, format_string, new Date())
}

export const get_vacation_duration = (start_date: string, end_date: string): number => {
  const start = new Date(start_date)
  const end = new Date(end_date)
  const diff_time = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diff_time / (1000 * 60 * 60 * 24))
}

export const get_vacation_days = (start_date: string, end_date: string): Date[] => {
  const start = new Date(start_date)
  const duration = get_vacation_duration(start_date, end_date)
  const days: Date[] = []
  
  for (let i = 0; i < duration; i++) {
    days.push(addDays(start, i))
  }
  
  return days
}

export const is_weekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 5 || day === 6 // Friday and Saturday
}

export const is_today = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Hebrew months for display
export const hebrew_months = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

// Hebrew days of the week
export const hebrew_days = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
]

export const hebrew_days_short = [
  'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'
]

export const get_hebrew_month = (date: Date): string => {
  return hebrew_months[date.getMonth()]
}

export const get_hebrew_day = (date: Date): string => {
  return hebrew_days[date.getDay()]
}

export const get_hebrew_day_short = (date: Date): string => {
  return hebrew_days_short[date.getDay()]
}

// Hebrew date formatting
export const format_hebrew_date_full = (date: Date | string): string => {
  const date_obj = typeof date === 'string' ? new Date(date) : date
  const day = get_hebrew_day(date_obj)
  const date_num = date_obj.getDate()
  const month = get_hebrew_month(date_obj)
  const year = date_obj.getFullYear()
  
  return `יום ${day}, ${date_num} ב${month} ${year}`
}

export const format_hebrew_date_short = (date: Date | string): string => {
  const date_obj = typeof date === 'string' ? new Date(date) : date
  return `${date_obj.getDate()}/${date_obj.getMonth() + 1}/${date_obj.getFullYear()}`
}

export const format_hebrew_time = (time: string | Date): string => {
  let hours: number, minutes: number
  
  if (typeof time === 'string') {
    const [h, m] = time.split(':').map(Number)
    hours = h
    minutes = m
  } else {
    hours = time.getHours()
    minutes = time.getMinutes()
  }
  
  const formatted_hours = hours.toString().padStart(2, '0')
  const formatted_minutes = minutes.toString().padStart(2, '0')
  
  return `${formatted_hours}:${formatted_minutes}`
}

// Check if date is a Jewish holiday or Shabbat
export const is_shabbat = (date: Date): boolean => {
  return date.getDay() === 6 // Saturday
}

export const is_friday_evening = (date: Date, hour: number = 18): boolean => {
  return date.getDay() === 5 && date.getHours() >= hour
}

// Format vacation date range in Hebrew
export const format_vacation_range = (start_date: string | Date, end_date: string | Date): string => {
  const start = typeof start_date === 'string' ? new Date(start_date) : start_date
  const end = typeof end_date === 'string' ? new Date(end_date) : end_date
  
  const start_formatted = format_hebrew_date_short(start)
  const end_formatted = format_hebrew_date_short(end)
  
  return `${start_formatted} - ${end_formatted}`
}

// Get relative time in Hebrew
export const get_relative_time_hebrew = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'היום'
  if (days === 1) return 'אתמול'
  if (days === -1) return 'מחר'
  if (days > 0) return `לפני ${days} ימים`
  return `בעוד ${Math.abs(days)} ימים`
}

// Main Hebrew date formatter with format options
export const format_hebrew_date = (date: Date | string, format_type: 'full' | 'short' | 'medium' = 'medium'): string => {
  const date_obj = typeof date === 'string' ? new Date(date) : date
  
  switch (format_type) {
    case 'full':
      return format_hebrew_date_full(date_obj)
    case 'short':
      return format_hebrew_date_short(date_obj)
    case 'medium':
    default:
      const day_name = get_hebrew_day_short(date_obj)
      const date_num = date_obj.getDate()
      const month = get_hebrew_month(date_obj)
      return `${day_name} ${date_num} ${month}`
  }
}