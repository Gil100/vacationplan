import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Vacation, VacationActivity } from './vacation_store'

export interface VacationTemplate {
  id: string
  name: string
  description: string
  category: 'family' | 'couple' | 'business' | 'adventure' | 'relaxation' | 'cultural'
  duration_days: number
  estimated_budget: number
  destinations: string[]
  tags: string[]
  is_public: boolean
  is_featured: boolean
  created_at: string
  created_by: 'user' | 'system'
  usage_count: number
  rating: number
  
  // Template data
  vacation_template: Omit<Vacation, 'id' | 'created_at' | 'updated_at'>
  activities_template: Omit<VacationActivity, 'id' | 'vacation_id'>[]
}

interface VacationTemplatesState {
  templates: VacationTemplate[]
  user_templates: VacationTemplate[]
  featured_templates: VacationTemplate[]
  loading: boolean
  error: string | null
}

interface VacationTemplatesActions {
  // Template CRUD
  create_template_from_vacation: (
    vacation: Vacation, 
    activities: VacationActivity[],
    template_info: Pick<VacationTemplate, 'name' | 'description' | 'category' | 'tags'>
  ) => void
  delete_template: (template_id: string) => void
  update_template: (template_id: string, updates: Partial<VacationTemplate>) => void
  
  // Template usage
  create_vacation_from_template: (template_id: string) => { vacation: Vacation; activities: VacationActivity[] }
  increment_usage: (template_id: string) => void
  rate_template: (template_id: string, rating: number) => void
  
  // Template discovery
  search_templates: (query: string) => VacationTemplate[]
  get_templates_by_category: (category: VacationTemplate['category']) => VacationTemplate[]
  get_templates_by_duration: (min_days: number, max_days: number) => VacationTemplate[]
  get_templates_by_budget: (max_budget: number) => VacationTemplate[]
  
  // Utility
  export_template: (template_id: string) => VacationTemplate | null
  import_template: (template: VacationTemplate) => void
  set_loading: (loading: boolean) => void
  set_error: (error: string | null) => void
}

type VacationTemplatesStore = VacationTemplatesState & VacationTemplatesActions

const generate_id = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Pre-built system templates
const system_templates: VacationTemplate[] = [
  {
    id: 'tpl-001',
    name: 'סוף שבוע רומנטי בירושלים',
    description: 'חופשה קצרה ורומנטית במקומות הקדושים והיפים של ירושלים',
    category: 'couple',
    duration_days: 2,
    estimated_budget: 1500,
    destinations: ['ירושלים'],
    tags: ['רומנטי', 'תרבות', 'דתי', 'קצר'],
    is_public: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    created_by: 'system',
    usage_count: 0,
    rating: 4.8,
    vacation_template: {
      title: 'סוף שבוע רומנטי בירושלים',
      destination: 'ירושלים',
      start_date: '',
      end_date: '',
      participants: 2,
      budget: 1500,
      description: 'חופשה קצרה ורומנטיה ברמה גבוהה בעיר הקודש',
      status: 'draft'
    },
    activities_template: [
      {
        day: 1,
        title: 'הגעה ואכלוס במלון',
        description: 'הגעה למלון והתארגנות',
        location: 'מלון ממילא',
        start_time: '15:00',
        end_time: '16:30',
        cost: 0,
        category: 'accommodation',
        notes: 'חדר עם נוף לעיר העתיקה'
      },
      {
        day: 1,
        title: 'ביקור בכותל המערבי',
        description: 'ביקור רגשי במקום הקדוש',
        location: 'הכותל המערבי',
        start_time: '17:00',
        end_time: '18:30',
        cost: 0,
        category: 'activity',
        notes: 'תפילת מעריב משותפת'
      },
      {
        day: 1,
        title: 'ארוחת ערב במסעדה כשרה יוקרתית',
        description: 'ארוחה רומנטית עם נוף לעיר העתיקה',
        location: 'מסעדת רוזנטליס',
        start_time: '20:00',
        end_time: '22:30',
        cost: 400,
        category: 'food',
        notes: 'הזמנת שולחן מראש'
      }
    ]
  },
  {
    id: 'tpl-002',
    name: 'חופשה משפחתית באילת',
    description: 'שבוע של כיף משפחתי בעיר הנופש הדרומית',
    category: 'family',
    duration_days: 7,
    estimated_budget: 8000,
    destinations: ['אילת'],
    tags: ['משפחתי', 'ים', 'פעילויות', 'ילדים'],
    is_public: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    created_by: 'system',
    usage_count: 0,
    rating: 4.6,
    vacation_template: {
      title: 'חופשה משפחתית באילת',
      destination: 'אילת',
      start_date: '',
      end_date: '',
      participants: 4,
      budget: 8000,
      description: 'חופשה מושלמת למשפחה עם ילדים בעיר הנופש',
      status: 'draft'
    },
    activities_template: [
      {
        day: 1,
        title: 'הגעה והתארגנות',
        description: 'הגעה למלון והכרת האזור',
        location: 'מלון דן אילת',
        start_time: '14:00',
        end_time: '16:00',
        cost: 0,
        category: 'accommodation',
        notes: 'צ\'ק אין ומשחקי מגרש לילדים'
      },
      {
        day: 1,
        title: 'שנורקלינג במצפה תת-ימי',
        description: 'צפייה בעולם התת-ימי האמיתי',
        location: 'מצפה תת-ימי אילת',
        start_time: '17:00',
        end_time: '19:00',
        cost: 300,
        category: 'activity',
        notes: 'מתאים לכל הגילאים'
      }
    ]
  }
]

export const use_vacation_templates = create<VacationTemplatesStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        templates: system_templates,
        user_templates: [],
        featured_templates: system_templates.filter(t => t.is_featured),
        loading: false,
        error: null,

        // Create template from existing vacation
        create_template_from_vacation: (vacation, activities, template_info) => {
          const new_template: VacationTemplate = {
            id: generate_id(),
            ...template_info,
            duration_days: Math.ceil(
              (new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) 
              / (1000 * 60 * 60 * 24)
            ),
            estimated_budget: vacation.budget || 0,
            destinations: [vacation.destination],
            is_public: false,
            is_featured: false,
            created_at: new Date().toISOString(),
            created_by: 'user',
            usage_count: 0,
            rating: 0,
            vacation_template: {
              title: template_info.name,
              destination: vacation.destination,
              start_date: '',
              end_date: '',
              participants: vacation.participants,
              budget: vacation.budget,
              description: template_info.description,
              status: 'draft'
            },
            activities_template: activities.map(activity => ({
              day: activity.day,
              title: activity.title,
              description: activity.description,
              location: activity.location,
              start_time: activity.start_time,
              end_time: activity.end_time,
              cost: activity.cost,
              category: activity.category,
              notes: activity.notes
            }))
          }

          set(state => ({
            user_templates: [...state.user_templates, new_template],
            templates: [...state.templates, new_template]
          }))
        },

        // Delete template
        delete_template: (template_id) => {
          set(state => ({
            templates: state.templates.filter(t => t.id !== template_id),
            user_templates: state.user_templates.filter(t => t.id !== template_id),
            featured_templates: state.featured_templates.filter(t => t.id !== template_id)
          }))
        },

        // Update template
        update_template: (template_id, updates) => {
          set(state => ({
            templates: state.templates.map(t => 
              t.id === template_id ? { ...t, ...updates } : t
            ),
            user_templates: state.user_templates.map(t => 
              t.id === template_id ? { ...t, ...updates } : t
            ),
            featured_templates: state.featured_templates.map(t => 
              t.id === template_id ? { ...t, ...updates } : t
            )
          }))
        },

        // Create vacation from template
        create_vacation_from_template: (template_id) => {
          const template = get().templates.find(t => t.id === template_id)
          if (!template) {
            throw new Error('Template not found')
          }

          // Increment usage count
          get().increment_usage(template_id)

          // Create new vacation
          const vacation: Vacation = {
            id: generate_id(),
            ...template.vacation_template,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          // Create activities
          const activities: VacationActivity[] = template.activities_template.map(activity => ({
            id: generate_id(),
            vacation_id: vacation.id,
            ...activity
          }))

          return { vacation, activities }
        },

        // Increment usage count
        increment_usage: (template_id) => {
          set(state => ({
            templates: state.templates.map(t => 
              t.id === template_id ? { ...t, usage_count: t.usage_count + 1 } : t
            ),
            user_templates: state.user_templates.map(t => 
              t.id === template_id ? { ...t, usage_count: t.usage_count + 1 } : t
            )
          }))
        },

        // Rate template
        rate_template: (template_id, rating) => {
          set(state => ({
            templates: state.templates.map(t => 
              t.id === template_id ? { ...t, rating } : t
            ),
            user_templates: state.user_templates.map(t => 
              t.id === template_id ? { ...t, rating } : t
            )
          }))
        },

        // Search templates
        search_templates: (query) => {
          const query_lower = query.toLowerCase()
          return get().templates.filter(template =>
            template.name.toLowerCase().includes(query_lower) ||
            template.description.toLowerCase().includes(query_lower) ||
            template.destinations.some(dest => dest.toLowerCase().includes(query_lower)) ||
            template.tags.some(tag => tag.toLowerCase().includes(query_lower))
          )
        },

        // Get by category
        get_templates_by_category: (category) => {
          return get().templates.filter(t => t.category === category)
        },

        // Get by duration
        get_templates_by_duration: (min_days, max_days) => {
          return get().templates.filter(t => 
            t.duration_days >= min_days && t.duration_days <= max_days
          )
        },

        // Get by budget
        get_templates_by_budget: (max_budget) => {
          return get().templates.filter(t => t.estimated_budget <= max_budget)
        },

        // Export template
        export_template: (template_id) => {
          return get().templates.find(t => t.id === template_id) || null
        },

        // Import template
        import_template: (template) => {
          const new_template = {
            ...template,
            id: generate_id(),
            created_at: new Date().toISOString(),
            created_by: 'user' as const,
            usage_count: 0
          }

          set(state => ({
            templates: [...state.templates, new_template],
            user_templates: [...state.user_templates, new_template]
          }))
        },

        // Utility actions
        set_loading: (loading) => set({ loading }),
        set_error: (error) => set({ error })
      }),
      {
        name: 'vacation_templates',
        partialize: (state) => ({
          user_templates: state.user_templates,
          templates: state.templates.filter(t => t.created_by === 'user')
        })
      }
    ),
    { name: 'vacation-templates-store' }
  )
)