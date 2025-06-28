import { ActivityCategory } from '../types'

export interface ActivityTemplate {
  id: string
  title: string
  description: string
  category: ActivityCategory
  duration: number // minutes
  estimated_cost: number // NIS
  icon: string
  tags: string[]
  is_kosher_friendly: boolean
  is_shabbat_friendly: boolean
  suggested_times: string[] // e.g., ['09:00', '14:00']
  location_hints: string[] // Common location types for this activity
}

export const activity_templates: ActivityTemplate[] = [
  // Attractions
  {
    id: 'att-001',
    title: 'ביקור בכותל המערבי',
    description: 'ביקור קדוש במקום הקדוש ביותר לעם היהודי',
    category: ActivityCategory.ATTRACTION,
    duration: 90,
    estimated_cost: 0,
    icon: '🕍',
    tags: ['דתי', 'היסטורי', 'חינם', 'ירושלים'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['08:00', '15:00', '17:00'],
    location_hints: ['רובע היהודי', 'ירושלים', 'העיר העתיקה']
  },
  {
    id: 'att-002',
    title: 'סיור במוזיאון ישראל',
    description: 'מוזיאון הדגל של ישראל עם אוספי אמנות ויודיקה',
    category: ActivityCategory.CULTURE,
    duration: 180,
    estimated_cost: 54,
    icon: '🏛️',
    tags: ['תרבות', 'אמנות', 'למשפחות', 'ירושלים'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['10:00', '14:00'],
    location_hints: ['שדרות רופין', 'גבעת רם', 'מוזיאון ישראל']
  },
  {
    id: 'att-003',
    title: 'טיול בגנים הבהאיים',
    description: 'גנים מדרגים מרהיבים עם נוף לחיפה ולים',
    category: ActivityCategory.NATURE,
    duration: 120,
    estimated_cost: 0,
    icon: '🌸',
    tags: ['טבע', 'צילום', 'נוף', 'חיפה', 'חינם'],
    is_kosher_friendly: true,
    is_shabbat_friendly: true,
    suggested_times: ['09:00', '16:00'],
    location_hints: ['הגנים הבהאיים', 'חיפה', 'הר הכרמל']
  },

  // Restaurants
  {
    id: 'res-001',
    title: 'ארוחת בוקר ישראלית',
    description: 'ארוחת בוקר עשירה במסעדה מקומית',
    category: ActivityCategory.RESTAURANT,
    duration: 90,
    estimated_cost: 65,
    icon: '🥯',
    tags: ['אוכל', 'בוקר', 'ישראלי', 'מקומי'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['08:00', '09:00', '10:00'],
    location_hints: ['קפה', 'מסעדה', 'שוק מחנה יהודה']
  },
  {
    id: 'res-002',
    title: 'אוכל רחוב בשוק',
    description: 'טעימות ממגוון דוכני האוכל בשוק',
    category: ActivityCategory.RESTAURANT,
    duration: 60,
    estimated_cost: 40,
    icon: '🌯',
    tags: ['אוכל רחוב', 'שוק', 'זול', 'מקומי'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['12:00', '13:00', '14:00'],
    location_hints: ['שוק מחנה יהודה', 'שוק הכרמל', 'שוק']
  },
  {
    id: 'res-003',
    title: 'ארוחת ערב חגיגית',
    description: 'ארוחת ערב במסעדה איכותית',
    category: ActivityCategory.RESTAURANT,
    duration: 150,
    estimated_cost: 180,
    icon: '🍽️',
    tags: ['ארוחת ערב', 'חגיגי', 'רומנטי', 'איכותי'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['19:00', '20:00', '21:00'],
    location_hints: ['מסעדה', 'נמל תל אביב', 'מרכז העיר']
  },

  // Nature & Beach
  {
    id: 'nat-001',
    title: 'יום חוף',
    description: 'יום רגוע בחוף הים התיכון',
    category: ActivityCategory.NATURE,
    duration: 240,
    estimated_cost: 50,
    icon: '🏖️',
    tags: ['חוף', 'שחייה', 'רגיעה', 'משפחתי'],
    is_kosher_friendly: true,
    is_shabbat_friendly: true,
    suggested_times: ['10:00', '11:00'],
    location_hints: ['חוף', 'תל אביב', 'חוף פרישמן', 'נתניה']
  },
  {
    id: 'nat-002',
    title: 'טיול בפארק הירקון',
    description: 'טיול, השכרת אופניים ופיקניק',
    category: ActivityCategory.NATURE,
    duration: 180,
    estimated_cost: 30,
    icon: '🌳',
    tags: ['פארק', 'אופניים', 'פיקניק', 'ספורט'],
    is_kosher_friendly: true,
    is_shabbat_friendly: true,
    suggested_times: ['09:00', '16:00'],
    location_hints: ['פארק הירקון', 'תל אביב', 'פארק']
  },

  // Shopping
  {
    id: 'sho-001',
    title: 'קניות בדיזנגוף',
    description: 'קניות במרכז דיזנגוף ובשדרות',
    category: ActivityCategory.SHOPPING,
    duration: 120,
    estimated_cost: 200,
    icon: '🛍️',
    tags: ['קניות', 'אופנה', 'מרכז', 'תל אביב'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['11:00', '14:00', '16:00'],
    location_hints: ['דיזנגוף סנטר', 'שדרות דיזנגוף', 'תל אביב']
  },
  {
    id: 'sho-002',
    title: 'שוק מחנה יהודה',
    description: 'קניות ואוכל בשוק הססגוני של ירושלים',
    category: ActivityCategory.SHOPPING,
    duration: 150,
    estimated_cost: 100,
    icon: '🏪',
    tags: ['שוק', 'מקומי', 'אוכל', 'ירושלים'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['10:00', '12:00', '14:00'],
    location_hints: ['שוק מחנה יהודה', 'ירושלים', 'שוק']
  },

  // Entertainment
  {
    id: 'ent-001',
    title: 'הצגה בתיאטרון',
    description: 'הצגה בתיאטרון הקאמרי או הבימה',
    category: ActivityCategory.ENTERTAINMENT,
    duration: 180,
    estimated_cost: 120,
    icon: '🎭',
    tags: ['תיאטרון', 'תרבות', 'ערב', 'אמנות'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['20:00', '21:00'],
    location_hints: ['תיאטרון', 'תל אביב', 'ירושלים']
  },
  {
    id: 'ent-002',
    title: 'סרט בקולנוע',
    description: 'צפייה בסרט בקולנוע',
    category: ActivityCategory.ENTERTAINMENT,
    duration: 150,
    estimated_cost: 45,
    icon: '🎬',
    tags: ['קולנוע', 'בידור', 'משפחתי'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['15:00', '18:00', '21:00'],
    location_hints: ['קולנוע', 'מתחם', 'קניון']
  },

  // Sports & Activities
  {
    id: 'spo-001',
    title: 'צלילה באילת',
    description: 'צלילה באלמוגים בחוף אילת',
    category: ActivityCategory.SPORTS,
    duration: 180,
    estimated_cost: 150,
    icon: '🤿',
    tags: ['צלילה', 'ים', 'ספורט', 'אילת'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['09:00', '14:00'],
    location_hints: ['אילת', 'חוף', 'מרכז צלילה']
  },
  {
    id: 'spo-002',
    title: 'רכיבה על אופניים',
    description: 'טיול אופניים בשביל ישראל או טיילת',
    category: ActivityCategory.SPORTS,
    duration: 120,
    estimated_cost: 40,
    icon: '🚴',
    tags: ['אופניים', 'ספורט', 'טבע', 'טיילת'],
    is_kosher_friendly: true,
    is_shabbat_friendly: true,
    suggested_times: ['08:00', '16:00', '17:00'],
    location_hints: ['טיילת', 'פארק', 'שביל אופניים']
  },

  // Relaxation
  {
    id: 'rel-001',
    title: 'ספא וטיפולים',
    description: 'יום פינוק בספא עם טיפולי יופי ובריאות',
    category: ActivityCategory.RELAXATION,
    duration: 240,
    estimated_cost: 300,
    icon: '🧘',
    tags: ['ספא', 'טיפולים', 'רגיעה', 'פינוק'],
    is_kosher_friendly: true,
    is_shabbat_friendly: false,
    suggested_times: ['10:00', '14:00'],
    location_hints: ['ספא', 'מלון', 'מרכז בריאות']
  },
  {
    id: 'rel-002',
    title: 'יוגה בפארק',
    description: 'שיעור יוגה באוויר הפתוח',
    category: ActivityCategory.RELAXATION,
    duration: 90,
    estimated_cost: 50,
    icon: '🕉️',
    tags: ['יוגה', 'רגיעה', 'טבע', 'בריאות'],
    is_kosher_friendly: true,
    is_shabbat_friendly: true,
    suggested_times: ['07:00', '18:00'],
    location_hints: ['פארק', 'טיילת', 'חוף']
  }
]

export class ActivityTemplateService {
  // Get all templates
  get_all_templates = (): ActivityTemplate[] => {
    return activity_templates
  }

  // Get templates by category
  get_templates_by_category = (category: ActivityCategory): ActivityTemplate[] => {
    return activity_templates.filter(template => template.category === category)
  }

  // Get templates by tags
  get_templates_by_tags = (tags: string[]): ActivityTemplate[] => {
    return activity_templates.filter(template =>
      tags.some(tag => template.tags.some(templateTag => 
        templateTag.toLowerCase().includes(tag.toLowerCase())
      ))
    )
  }

  // Get kosher-friendly templates
  get_kosher_templates = (): ActivityTemplate[] => {
    return activity_templates.filter(template => template.is_kosher_friendly)
  }

  // Get Shabbat-friendly templates
  get_shabbat_templates = (): ActivityTemplate[] => {
    return activity_templates.filter(template => template.is_shabbat_friendly)
  }

  // Get templates by time of day
  get_templates_by_time = (time: string): ActivityTemplate[] => {
    const hour = parseInt(time.split(':')[0])
    
    return activity_templates.filter(template => {
      return template.suggested_times.some(suggestedTime => {
        const suggestedHour = parseInt(suggestedTime.split(':')[0])
        return Math.abs(hour - suggestedHour) <= 2 // Within 2 hours
      })
    })
  }

  // Get templates by budget range
  get_templates_by_budget = (min_cost: number, max_cost: number): ActivityTemplate[] => {
    return activity_templates.filter(template => 
      template.estimated_cost >= min_cost && template.estimated_cost <= max_cost
    )
  }

  // Search templates
  search_templates = (query: string): ActivityTemplate[] => {
    const query_lower = query.toLowerCase()
    
    return activity_templates.filter(template =>
      template.title.toLowerCase().includes(query_lower) ||
      template.description.toLowerCase().includes(query_lower) ||
      template.tags.some(tag => tag.toLowerCase().includes(query_lower))
    )
  }

  // Get suggested templates based on context
  get_suggested_templates = (context: {
    category?: ActivityCategory
    time?: string
    budget_max?: number
    kosher_only?: boolean
    shabbat_friendly?: boolean
    location?: string
  }): ActivityTemplate[] => {
    let filtered_templates = [...activity_templates]

    if (context.category) {
      filtered_templates = filtered_templates.filter(t => t.category === context.category)
    }

    if (context.kosher_only) {
      filtered_templates = filtered_templates.filter(t => t.is_kosher_friendly)
    }

    if (context.shabbat_friendly) {
      filtered_templates = filtered_templates.filter(t => t.is_shabbat_friendly)
    }

    if (context.budget_max) {
      filtered_templates = filtered_templates.filter(t => t.estimated_cost <= context.budget_max)
    }

    if (context.time) {
      const time_templates = this.get_templates_by_time(context.time)
      filtered_templates = filtered_templates.filter(t => 
        time_templates.some(tt => tt.id === t.id)
      )
    }

    if (context.location) {
      const location_lower = context.location.toLowerCase()
      filtered_templates = filtered_templates.filter(t =>
        t.location_hints.some(hint => hint.toLowerCase().includes(location_lower)) ||
        t.tags.some(tag => tag.toLowerCase().includes(location_lower))
      )
    }

    return filtered_templates.slice(0, 8) // Limit results
  }
}

// Singleton instance
export const activity_template_service = new ActivityTemplateService()