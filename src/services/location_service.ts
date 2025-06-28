import { Location, LocationType, Coordinates } from '../types'
import { popular_destinations } from '../constants'

// Mock location data - Israeli destinations
const israeli_locations: Location[] = [
  // Jerusalem
  {
    id: 'jer-001',
    name: 'הכותל המערבי',
    address: 'רובע היהודי, ירושלים',
    coordinates: { latitude: 31.7767, longitude: 35.2345 },
    type: LocationType.ATTRACTION,
    amenities: ['חניה', 'שירותים', 'נגישות']
  },
  {
    id: 'jer-002', 
    name: 'מוזיאון ישראל',
    address: 'שדרות רופין 11, ירושלים',
    coordinates: { latitude: 31.7717, longitude: 35.2066 },
    type: LocationType.MUSEUM,
    amenities: ['חניה', 'מסעדה', 'חנות מזכרות', 'נגישות']
  },
  {
    id: 'jer-003',
    name: 'שוק מחנה יהודה',
    address: 'מחנה יהודה, ירושלים',
    coordinates: { latitude: 31.7857, longitude: 35.2127 },
    type: LocationType.SHOPPING_CENTER,
    amenities: ['אוכל רחוב', 'חניה ציבורית', 'כשר']
  },
  
  // Tel Aviv
  {
    id: 'tlv-001',
    name: 'חוף פרישמן',
    address: 'חוף פרישמן, תל אביב',
    coordinates: { latitude: 32.0858, longitude: 34.7694 },
    type: LocationType.BEACH,
    amenities: ['מציל', 'שירותים', 'מקלחות', 'בר חוף']
  },
  {
    id: 'tlv-002',
    name: 'נמל תל אביב',
    address: 'נמל תל אביב, תל אביב',
    coordinates: { latitude: 32.0923, longitude: 34.7694 },
    type: LocationType.ENTERTAINMENT,
    amenities: ['מסעדות', 'חניה', 'קניות', 'בידור']
  },
  {
    id: 'tlv-003',
    name: 'פארק הירקון',
    address: 'פארק הירקון, תל אביב',
    coordinates: { latitude: 32.1148, longitude: 34.8051 },
    type: LocationType.PARK,
    amenities: ['השכרת אופניים', 'אזורי פיקניק', 'חניה', 'מגרשי ספורט']
  },
  
  // Haifa
  {
    id: 'hfa-001',
    name: 'הגנים הבהאיים',
    address: 'הגנים הבהאיים, חיפה',
    coordinates: { latitude: 32.8155, longitude: 34.9886 },
    type: LocationType.ATTRACTION,
    amenities: ['סיורים מודרכים', 'חניה', 'נגישות']
  },
  
  // Eilat
  {
    id: 'elt-001',
    name: 'חוף אלמוג',
    address: 'חוף אלמוג, אילת',
    coordinates: { latitude: 29.5581, longitude: 34.9481 },
    type: LocationType.BEACH,
    amenities: ['צלילה', 'שנורקלינג', 'בר חוף', 'השכרת ציוד']
  },
  {
    id: 'elt-002',
    name: 'אקווריום המפרץ',
    address: 'אקווריום המפרץ, אילת',
    coordinates: { latitude: 29.5469, longitude: 34.9516 },
    type: LocationType.ATTRACTION,
    amenities: ['מסעדה', 'חנות מזכרות', 'חניה', 'נגישות']
  }
]

export interface LocationSearchFilters {
  query?: string
  location_type?: LocationType
  destination?: string
  has_kosher_options?: boolean
  wheelchair_accessible?: boolean
  amenities?: string[]
}

export class LocationService {
  private locations: Location[] = israeli_locations

  // Search locations based on query and filters
  search_locations = async (filters: LocationSearchFilters): Promise<Location[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered_locations = [...this.locations]
    
    // Filter by query (name or address)
    if (filters.query && filters.query.trim() !== '') {
      const query_lower = filters.query.toLowerCase()
      filtered_locations = filtered_locations.filter(location =>
        location.name.toLowerCase().includes(query_lower) ||
        location.address.toLowerCase().includes(query_lower)
      )
    }
    
    // Filter by location type
    if (filters.location_type) {
      filtered_locations = filtered_locations.filter(location =>
        location.type === filters.location_type
      )
    }
    
    // Filter by destination (city)
    if (filters.destination) {
      const destination_lower = filters.destination.toLowerCase()
      filtered_locations = filtered_locations.filter(location =>
        location.address.toLowerCase().includes(destination_lower)
      )
    }
    
    // Filter by kosher options
    if (filters.has_kosher_options) {
      filtered_locations = filtered_locations.filter(location =>
        location.amenities.some(amenity => amenity.includes('כשר'))
      )
    }
    
    // Filter by wheelchair accessibility
    if (filters.wheelchair_accessible) {
      filtered_locations = filtered_locations.filter(location =>
        location.amenities.includes('נגישות')
      )
    }
    
    // Filter by specific amenities
    if (filters.amenities && filters.amenities.length > 0) {
      filtered_locations = filtered_locations.filter(location =>
        filters.amenities!.some(amenity =>
          location.amenities.includes(amenity)
        )
      )
    }
    
    return filtered_locations
  }

  // Get location by ID
  get_location_by_id = async (id: string): Promise<Location | null> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.locations.find(location => location.id === id) || null
  }

  // Get locations by destination
  get_locations_by_destination = async (destination: string): Promise<Location[]> => {
    return this.search_locations({ destination })
  }

  // Get location suggestions based on activity category
  get_suggested_locations_for_category = async (
    category: string,
    destination?: string
  ): Promise<Location[]> => {
    const category_to_type_map: Record<string, LocationType> = {
      'restaurant': LocationType.RESTAURANT,
      'accommodation': LocationType.HOTEL,
      'attraction': LocationType.ATTRACTION,
      'shopping': LocationType.SHOPPING_CENTER,
      'nature': LocationType.PARK,
      'culture': LocationType.MUSEUM,
      'entertainment': LocationType.ENTERTAINMENT,
      'relaxation': LocationType.BEACH
    }
    
    const location_type = category_to_type_map[category]
    if (!location_type) {
      return []
    }
    
    return this.search_locations({
      location_type,
      destination
    })
  }

  // Add new location (for future API integration)
  add_location = async (location_data: Omit<Location, 'id'>): Promise<Location> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const new_location: Location = {
      ...location_data,
      id: `custom-${Date.now()}`
    }
    
    this.locations.push(new_location)
    return new_location
  }

  // Get popular destinations
  get_popular_destinations = (): string[] => {
    return popular_destinations
  }
}

// Singleton instance
export const location_service = new LocationService()