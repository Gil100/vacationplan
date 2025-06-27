// Currency and number formatting utilities for Israeli context

export const format_currency = (amount: number, currency: 'ILS' | 'USD' | 'EUR' = 'ILS'): string => {
  const formatter = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

export const format_number = (num: number): string => {
  return new Intl.NumberFormat('he-IL').format(num)
}

export const format_percentage = (num: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num / 100)
}

// Text utilities for Hebrew/RTL
export const truncate_text = (text: string, max_length: number): string => {
  if (text.length <= max_length) return text
  return text.substring(0, max_length) + '...'
}

export const capitalize_first = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const format_phone_number = (phone: string): string => {
  // Israeli phone number formatting
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  return phone
}

// URL and slug utilities
export const create_slug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Validation utilities
export const is_valid_email = (email: string): boolean => {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return email_regex.test(email)
}

export const is_valid_israeli_phone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 9 || cleaned.length === 10
}

// Array utilities
export const remove_duplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export const sort_by_key = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const a_val = a[key]
    const b_val = b[key]
    
    if (a_val < b_val) return direction === 'asc' ? -1 : 1
    if (a_val > b_val) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Object utilities
export const deep_merge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deep_merge(result[key] || {} as any, source[key] as any)
    } else {
      result[key] = source[key] as any
    }
  }
  
  return result
}

export const pick_keys = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  
  return result
}

export const omit_keys = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  
  keys.forEach(key => {
    delete result[key]
  })
  
  return result
}