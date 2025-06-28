import React, { useState, useEffect, useRef } from 'react'
import { Location, LocationType } from '../../types'
import { location_service, LocationSearchFilters } from '../../services/location_service'
import { use_translations } from '../../hooks/use_translations'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface LocationPickerProps {
  value?: Location | null
  onChange: (location: Location | null) => void
  placeholder?: string
  destination?: string
  activity_category?: string
  show_suggestions?: boolean
  className?: string
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder,
  destination,
  activity_category,
  show_suggestions = true,
  className = ''
}) => {
  const { t } = use_translations()
  const [query, set_query] = useState(value?.name || '')
  const [suggestions, set_suggestions] = useState<Location[]>([])
  const [is_open, set_is_open] = useState(false)
  const [loading, set_loading] = useState(false)
  const input_ref = useRef<HTMLInputElement>(null)
  const dropdown_ref = useRef<HTMLDivElement>(null)

  // Search locations when query changes
  useEffect(() => {
    const search_locations = async () => {
      if (query.trim().length < 2) {
        set_suggestions([])
        return
      }

      set_loading(true)
      try {
        const filters: LocationSearchFilters = {
          query: query.trim(),
          destination
        }

        const results = await location_service.search_locations(filters)
        set_suggestions(results.slice(0, 8)) // Limit to 8 results
      } catch (error) {
        console.error('Error searching locations:', error)
        set_suggestions([])
      } finally {
        set_loading(false)
      }
    }

    const debounce_timer = setTimeout(search_locations, 300)
    return () => clearTimeout(debounce_timer)
  }, [query, destination])

  // Load category suggestions when opened
  useEffect(() => {
    if (is_open && show_suggestions && activity_category && query.trim().length === 0) {
      const load_suggestions = async () => {
        set_loading(true)
        try {
          const suggested_locations = await location_service.get_suggested_locations_for_category(
            activity_category,
            destination
          )
          set_suggestions(suggested_locations.slice(0, 6))
        } catch (error) {
          console.error('Error loading category suggestions:', error)
        } finally {
          set_loading(false)
        }
      }
      load_suggestions()
    }
  }, [is_open, show_suggestions, activity_category, destination, query])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handle_click_outside = (event: MouseEvent) => {
      if (
        dropdown_ref.current &&
        !dropdown_ref.current.contains(event.target as Node) &&
        input_ref.current &&
        !input_ref.current.contains(event.target as Node)
      ) {
        set_is_open(false)
      }
    }

    document.addEventListener('mousedown', handle_click_outside)
    return () => document.removeEventListener('mousedown', handle_click_outside)
  }, [])

  const handle_input_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const new_value = e.target.value
    set_query(new_value)
    set_is_open(true)

    // Clear selection if query is cleared
    if (new_value.trim() === '' && value) {
      onChange(null)
    }
  }

  const handle_input_focus = () => {
    set_is_open(true)
  }

  const handle_location_select = (location: Location) => {
    set_query(location.name)
    onChange(location)
    set_is_open(false)
  }

  const handle_clear = () => {
    set_query('')
    onChange(null)
    input_ref.current?.focus()
  }

  const get_location_type_label = (type: LocationType): string => {
    const type_labels: Record<LocationType, string> = {
      [LocationType.RESTAURANT]: 'מסעדה',
      [LocationType.HOTEL]: 'מלון',
      [LocationType.ATTRACTION]: 'אטרקציה',
      [LocationType.BEACH]: 'חוף',
      [LocationType.PARK]: 'פארק',
      [LocationType.MUSEUM]: 'מוזיאון',
      [LocationType.SHOPPING_CENTER]: 'מרכז קניות',
      [LocationType.TRANSPORTATION_HUB]: 'תחבורה'
    }
    return type_labels[type] || type
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={input_ref}
          value={query}
          onChange={handle_input_change}
          onFocus={handle_input_focus}
          placeholder={placeholder || t('common.search_location')}
          className="w-full"
          dir="rtl"
        />
        
        {/* Clear button */}
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handle_clear}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
          >
            ✕
          </Button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {is_open && (suggestions.length > 0 || show_suggestions) && (
        <div
          ref={dropdown_ref}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {/* Category suggestions header */}
          {show_suggestions && activity_category && query.trim().length === 0 && (
            <div className="px-3 py-2 text-sm font-medium text-gray-600 border-b border-gray-100">
              הצעות עבור {activity_category}
            </div>
          )}

          {/* Location suggestions */}
          {suggestions.map((location) => (
            <button
              key={location.id}
              onClick={() => handle_location_select(location)}
              className="w-full px-3 py-2 text-right hover:bg-gray-50 border-b border-gray-50 last:border-b-0 focus:outline-none focus:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {get_location_type_label(location.type)}
                  </span>
                  {location.amenities.includes('כשר') && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      כשר
                    </span>
                  )}
                  {location.amenities.includes('נגישות') && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      נגיש
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500">{location.address}</div>
                </div>
              </div>
            </button>
          ))}

          {/* No results */}
          {query.trim().length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              לא נמצאו תוצאות עבור "{query}"
            </div>
          )}

          {/* Custom location option */}
          {query.trim().length >= 2 && !suggestions.find(loc => loc.name === query) && (
            <button
              onClick={() => {
                const custom_location: Location = {
                  id: `custom-${Date.now()}`,
                  name: query,
                  address: query,
                  coordinates: { latitude: 0, longitude: 0 },
                  type: LocationType.ATTRACTION,
                  amenities: []
                }
                handle_location_select(custom_location)
              }}
              className="w-full px-3 py-2 text-right hover:bg-gray-50 border-t border-gray-200 focus:outline-none focus:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  מותאם אישית
                </span>
                <div className="text-right">
                  <div className="font-medium text-gray-900">שמור כ: "{query}"</div>
                  <div className="text-sm text-gray-500">יצירת מיקום מותאם אישית</div>
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}