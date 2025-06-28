/**
 * Currency formatting utilities for NIS (Israeli Shekel)
 */

export const format_currency = (amount: number, currency: 'NIS' | 'USD' | 'EUR' = 'NIS'): string => {
  const currency_symbols = {
    NIS: '₪',
    USD: '$',
    EUR: '€'
  }

  const symbol = currency_symbols[currency]
  
  // Format with Israeli number formatting (comma as thousands separator)
  const formatted_amount = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(Math.abs(amount))

  // For NIS, put symbol after the number (Israeli convention)
  if (currency === 'NIS') {
    return amount < 0 ? `-${formatted_amount}${symbol}` : `${formatted_amount}${symbol}`
  }
  
  // For other currencies, put symbol before
  return amount < 0 ? `-${symbol}${formatted_amount}` : `${symbol}${formatted_amount}`
}

export const parse_currency = (value: string): number => {
  // Remove currency symbols and format characters
  const cleaned = value.replace(/[₪$€,\s]/g, '')
  const number = parseFloat(cleaned)
  return isNaN(number) ? 0 : number
}

export const format_budget_range = (min: number, max: number, currency: 'NIS' | 'USD' | 'EUR' = 'NIS'): string => {
  if (min === max) {
    return format_currency(min, currency)
  }
  return `${format_currency(min, currency)} - ${format_currency(max, currency)}`
}

export const calculate_budget_percentage = (spent: number, total: number): number => {
  if (total === 0) return 0
  return (spent / total) * 100
}

export const get_budget_status = (spent: number, total: number): 'under' | 'near' | 'over' => {
  const percentage = calculate_budget_percentage(spent, total)
  
  if (percentage >= 100) return 'over'
  if (percentage >= 80) return 'near'
  return 'under'
}

export const format_cost_per_person = (total_cost: number, participants: number): string => {
  if (participants === 0) return format_currency(0)
  
  const cost_per_person = total_cost / participants
  return format_currency(cost_per_person)
}

export const convert_currency = (amount: number, from: 'NIS' | 'USD' | 'EUR', to: 'NIS' | 'USD' | 'EUR'): number => {
  // Mock exchange rates - in a real app, these would come from an API
  const exchange_rates = {
    NIS: { NIS: 1, USD: 0.27, EUR: 0.25 },
    USD: { NIS: 3.7, USD: 1, EUR: 0.92 },
    EUR: { NIS: 4.0, USD: 1.09, EUR: 1 }
  }
  
  return amount * exchange_rates[from][to]
}