// Time and duration calculation utilities

export interface TimeSlot {
  start_time: string
  end_time: string
  duration_minutes: number
}

export interface TimeConflict {
  activity1_id: string
  activity2_id: string
  overlap_minutes: number
  message: string
}

// Convert time string (HH:mm) to minutes since midnight
export const time_to_minutes = (time: string): number => {
  if (!time || typeof time !== 'string' || !time.includes(':')) return 0
  try {
    const [hours, minutes] = time.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0
    return hours * 60 + (minutes || 0)
  } catch (error) {
    console.warn('Invalid time format:', time)
    return 0
  }
}

// Convert minutes since midnight to time string (HH:mm)
export const minutes_to_time = (minutes: number): string => {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return '00:00'
  }
  const hours = Math.floor(minutes / 60) % 24 // Ensure hours stay within 24-hour format
  const mins = Math.floor(minutes % 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Calculate duration between two times in minutes
export const calculate_duration = (start_time: string, end_time: string): number => {
  if (!start_time || !end_time) return 0
  
  const start_minutes = time_to_minutes(start_time)
  const end_minutes = time_to_minutes(end_time)
  
  // Handle overnight times (end_time next day)
  if (end_minutes < start_minutes) {
    return (24 * 60) - start_minutes + end_minutes
  }
  
  return end_minutes - start_minutes
}

// Add duration to a start time
export const add_duration_to_time = (start_time: string, duration_minutes: number): string => {
  if (!start_time) return ''
  
  const start_minutes = time_to_minutes(start_time)
  const end_minutes = (start_minutes + duration_minutes) % (24 * 60)
  
  return minutes_to_time(end_minutes)
}

// Check if two time periods overlap
export const times_overlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean => {
  if (!start1 || !end1 || !start2 || !end2) return false
  
  const start1_min = time_to_minutes(start1)
  const end1_min = time_to_minutes(end1)
  const start2_min = time_to_minutes(start2)
  const end2_min = time_to_minutes(end2)
  
  return start1_min < end2_min && start2_min < end1_min
}

// Calculate overlap duration between two time periods
export const calculate_overlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): number => {
  if (!times_overlap(start1, end1, start2, end2)) return 0
  
  const start1_min = time_to_minutes(start1)
  const end1_min = time_to_minutes(end1)
  const start2_min = time_to_minutes(start2)
  const end2_min = time_to_minutes(end2)
  
  const overlap_start = Math.max(start1_min, start2_min)
  const overlap_end = Math.min(end1_min, end2_min)
  
  return overlap_end - overlap_start
}

// Format duration for display (e.g., "2h 30m", "45m")
export const format_duration = (minutes: number, format: 'short' | 'long' = 'short'): string => {
  if (minutes <= 0) return format === 'short' ? '0m' : '0 דקות'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (format === 'short') {
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  } else {
    const parts = []
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'שעה' : 'שעות'}`)
    if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'דקה' : 'דקות'}`)
    return parts.join(' ו')
  }
}

// Get suggested time slots for an activity based on existing activities
export const suggest_time_slots = (
  existing_activities: Array<{ start_time?: string; end_time?: string }>,
  desired_duration: number = 60,
  day_start: string = '08:00',
  day_end: string = '22:00'
): string[] => {
  const day_start_min = time_to_minutes(day_start)
  const day_end_min = time_to_minutes(day_end)
  const suggestions: string[] = []
  
  // Create sorted list of occupied time slots
  const occupied_slots = existing_activities
    .filter(a => a.start_time && a.end_time)
    .map(a => ({
      start: time_to_minutes(a.start_time!),
      end: time_to_minutes(a.end_time!)
    }))
    .sort((a, b) => a.start - b.start)
  
  let current_time = day_start_min
  
  for (const slot of occupied_slots) {
    // Check if there's a gap before this slot
    if (current_time + desired_duration <= slot.start) {
      suggestions.push(minutes_to_time(current_time))
    }
    current_time = Math.max(current_time, slot.end)
  }
  
  // Check if there's time after the last activity
  if (current_time + desired_duration <= day_end_min) {
    suggestions.push(minutes_to_time(current_time))
  }
  
  return suggestions.slice(0, 5) // Return top 5 suggestions
}

// Validate if a time slot is available
export const is_time_slot_available = (
  start_time: string,
  end_time: string,
  existing_activities: Array<{ start_time?: string; end_time?: string }>,
  exclude_activity_id?: string
): boolean => {
  return existing_activities
    .filter(a => a.start_time && a.end_time)
    .every(activity => !times_overlap(start_time, end_time, activity.start_time!, activity.end_time!))
}

// Auto-schedule activities with minimal conflicts
export const auto_schedule_activities = (
  activities: Array<{ 
    id: string
    start_time?: string
    duration_minutes?: number
  }>,
  day_start: string = '08:00'
): Array<{ id: string; start_time: string; end_time: string }> => {
  const scheduled: Array<{ id: string; start_time: string; end_time: string }> = []
  let current_time = time_to_minutes(day_start)
  
  // Sort activities by existing start_time preference, then by duration
  const sorted_activities = [...activities].sort((a, b) => {
    if (a.start_time && !b.start_time) return -1
    if (!a.start_time && b.start_time) return 1
    if (a.start_time && b.start_time) {
      return time_to_minutes(a.start_time) - time_to_minutes(b.start_time)
    }
    return (b.duration_minutes || 60) - (a.duration_minutes || 60)
  })
  
  for (const activity of sorted_activities) {
    const duration = activity.duration_minutes || 60
    const preferred_time = activity.start_time ? time_to_minutes(activity.start_time) : current_time
    
    // Use preferred time if available, otherwise use current_time
    const start_minutes = Math.max(preferred_time, current_time)
    const end_minutes = start_minutes + duration
    
    scheduled.push({
      id: activity.id,
      start_time: minutes_to_time(start_minutes),
      end_time: minutes_to_time(end_minutes)
    })
    
    current_time = end_minutes + 15 // 15-minute buffer between activities
  }
  
  return scheduled
}