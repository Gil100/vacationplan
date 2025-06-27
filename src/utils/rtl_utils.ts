/**
 * RTL (Right-to-Left) utilities for Hebrew language support
 */

export type Direction = 'rtl' | 'ltr'

/**
 * Get the current document direction
 */
export const get_document_direction = (): Direction => {
  return document.documentElement.dir as Direction || 'rtl'
}

/**
 * Set the document direction
 */
export const set_document_direction = (direction: Direction): void => {
  document.documentElement.dir = direction
  document.documentElement.lang = direction === 'rtl' ? 'he' : 'en'
}

/**
 * Toggle between RTL and LTR direction
 */
export const toggle_direction = (): Direction => {
  const current_direction = get_document_direction()
  const new_direction: Direction = current_direction === 'rtl' ? 'ltr' : 'rtl'
  set_document_direction(new_direction)
  return new_direction
}

/**
 * Check if the current direction is RTL
 */
export const is_rtl = (): boolean => {
  return get_document_direction() === 'rtl'
}

/**
 * Check if the current direction is LTR
 */
export const is_ltr = (): boolean => {
  return get_document_direction() === 'ltr'
}

/**
 * Get the appropriate margin class based on direction
 */
export const get_margin_start = (size: string): string => {
  return is_rtl() ? `mr-${size}` : `ml-${size}`
}

/**
 * Get the appropriate margin class based on direction
 */
export const get_margin_end = (size: string): string => {
  return is_rtl() ? `ml-${size}` : `mr-${size}`
}

/**
 * Get the appropriate padding class based on direction
 */
export const get_padding_start = (size: string): string => {
  return is_rtl() ? `pr-${size}` : `pl-${size}`
}

/**
 * Get the appropriate padding class based on direction
 */
export const get_padding_end = (size: string): string => {
  return is_rtl() ? `pl-${size}` : `pr-${size}`
}

/**
 * Get the appropriate text alignment class based on direction
 */
export const get_text_alignment = (align: 'start' | 'end' | 'center'): string => {
  if (align === 'center') return 'text-center'
  if (align === 'start') return is_rtl() ? 'text-right' : 'text-left'
  return is_rtl() ? 'text-left' : 'text-right'
}

/**
 * Get the appropriate float class based on direction
 */
export const get_float = (position: 'start' | 'end'): string => {
  if (position === 'start') return is_rtl() ? 'float-right' : 'float-left'
  return is_rtl() ? 'float-left' : 'float-right'
}

/**
 * Get the appropriate border class based on direction
 */
export const get_border_start = (size: string): string => {
  return is_rtl() ? `border-r-${size}` : `border-l-${size}`
}

/**
 * Get the appropriate border class based on direction
 */
export const get_border_end = (size: string): string => {
  return is_rtl() ? `border-l-${size}` : `border-r-${size}`
}

/**
 * Get CSS class names for RTL-aware positioning
 */
export const rtl_classes = {
  text_start: get_text_alignment('start'),
  text_end: get_text_alignment('end'),
  float_start: get_float('start'),
  float_end: get_float('end'),
  margin_start_4: get_margin_start('4'),
  margin_end_4: get_margin_end('4'),
  padding_start_4: get_padding_start('4'),
  padding_end_4: get_padding_end('4'),
  border_start_2: get_border_start('2'),
  border_end_2: get_border_end('2'),
}