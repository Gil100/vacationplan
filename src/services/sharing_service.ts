import { Vacation, VacationActivity } from '../stores/vacation_store'

export interface SharedVacationData {
  vacation: Omit<Vacation, 'id'>
  activities: Omit<VacationActivity, 'id' | 'vacation_id'>[]
  shared_at: string
  shared_by: string
  share_id: string
  expires_at?: string
  view_count: number
  is_public: boolean
}

export interface ShareSettings {
  include_costs: boolean
  include_notes: boolean
  include_personal_info: boolean
  allow_copying: boolean
  expires_in_days?: number
  require_password?: string
}

export class SharingService {
  private readonly BASE_URL = window.location.origin
  private readonly SHARE_PREFIX = 'shared'

  // Create shareable link
  create_shareable_link = (
    vacation: Vacation, 
    activities: VacationActivity[], 
    settings: ShareSettings
  ): string => {
    const share_data = this.prepare_share_data(vacation, activities, settings)
    const encoded_data = this.encode_share_data(share_data)
    const share_id = this.generate_share_id()
    
    // Store in localStorage for demo (in production, use a backend)
    this.store_shared_vacation(share_id, share_data, settings)
    
    return `${this.BASE_URL}/${this.SHARE_PREFIX}/${share_id}`
  }

  // Create short shareable link
  create_short_link = (vacation_id: string): string => {
    const short_id = this.generate_short_id()
    
    // Store mapping (in production, use a backend)
    localStorage.setItem(`short_link_${short_id}`, vacation_id)
    
    return `${this.BASE_URL}/v/${short_id}`
  }

  // Resolve shared vacation from URL
  resolve_shared_vacation = async (share_id: string): Promise<SharedVacationData | null> => {
    try {
      // Try to get from localStorage (in production, fetch from backend)
      const stored_data = localStorage.getItem(`shared_${share_id}`)
      if (!stored_data) {
        return null
      }

      const shared_data: SharedVacationData = JSON.parse(stored_data)
      
      // Check if expired
      if (shared_data.expires_at && new Date(shared_data.expires_at) < new Date()) {
        localStorage.removeItem(`shared_${share_id}`)
        return null
      }

      // Increment view count
      shared_data.view_count += 1
      localStorage.setItem(`shared_${share_id}`, JSON.stringify(shared_data))

      return shared_data
    } catch {
      return null
    }
  }

  // Create email sharing content
  create_email_content = (
    vacation: Vacation, 
    activities: VacationActivity[], 
    share_link?: string
  ): { subject: string; body: string } => {
    const duration_days = Math.ceil(
      (new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const subject = `תכנית חופשה: ${vacation.title}`
    
    const body = `
היי!

רציתי לשתף איתך את תכנית החופשה שלי:

🌴 ${vacation.title}
📍 יעד: ${vacation.destination}
📅 תאריכים: ${vacation.start_date} - ${vacation.end_date}
⏱️ משך: ${duration_days} ימים
👥 משתתפים: ${vacation.participants}

🎯 פעילויות מתוכננות:
${activities.slice(0, 5).map((activity, index) => 
  `${index + 1}. ${activity.title}${activity.location ? ` (${activity.location})` : ''}`
).join('\n')}
${activities.length > 5 ? `\n... ועוד ${activities.length - 5} פעילויות` : ''}

${share_link ? `\n🔗 לצפייה בתכנית המלאה: ${share_link}\n` : ''}

${vacation.description ? `\nתיאור החופשה:\n${vacation.description}\n` : ''}

נשמח שתצטרף!

הופק באמצעות מתכנן החופשות 🌴
    `.trim()

    return { subject, body }
  }

  // Send email (opens email client)
  send_email = (vacation: Vacation, activities: VacationActivity[], share_link?: string): void => {
    const { subject, body } = this.create_email_content(vacation, activities, share_link)
    
    const email_url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(email_url)
  }

  // Share via WhatsApp
  share_whatsapp = (vacation: Vacation, activities: VacationActivity[], share_link?: string): void => {
    const { body } = this.create_email_content(vacation, activities, share_link)
    const whatsapp_url = `https://wa.me/?text=${encodeURIComponent(body)}`
    window.open(whatsapp_url, '_blank')
  }

  // Clone vacation from shared data
  clone_from_shared = (shared_data: SharedVacationData): { vacation: Vacation; activities: VacationActivity[] } => {
    const new_vacation_id = this.generate_id()
    
    const vacation: Vacation = {
      id: new_vacation_id,
      ...shared_data.vacation,
      title: `${shared_data.vacation.title} (מועתק)`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const activities: VacationActivity[] = shared_data.activities.map(activity => ({
      id: this.generate_id(),
      vacation_id: new_vacation_id,
      ...activity
    }))

    return { vacation, activities }
  }

  // Get share analytics
  get_share_analytics = (share_id: string): { view_count: number; shared_at: string } | null => {
    try {
      const stored_data = localStorage.getItem(`shared_${share_id}`)
      if (!stored_data) return null

      const shared_data: SharedVacationData = JSON.parse(stored_data)
      return {
        view_count: shared_data.view_count,
        shared_at: shared_data.shared_at
      }
    } catch {
      return null
    }
  }

  // Delete shared vacation
  delete_shared_vacation = (share_id: string): boolean => {
    try {
      localStorage.removeItem(`shared_${share_id}`)
      return true
    } catch {
      return false
    }
  }

  // List user's shared vacations
  get_user_shared_vacations = (): Array<{ share_id: string; data: SharedVacationData }> => {
    const shared_vacations: Array<{ share_id: string; data: SharedVacationData }> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('shared_')) {
        try {
          const share_id = key.replace('shared_', '')
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          shared_vacations.push({ share_id, data })
        } catch {
          // Skip invalid entries
        }
      }
    }
    
    return shared_vacations.sort((a, b) => 
      new Date(b.data.shared_at).getTime() - new Date(a.data.shared_at).getTime()
    )
  }

  // Private helper methods
  private prepare_share_data = (
    vacation: Vacation, 
    activities: VacationActivity[], 
    settings: ShareSettings
  ): SharedVacationData => {
    const filtered_vacation = { ...vacation }
    delete (filtered_vacation as any).id

    // Remove personal info if not included
    if (!settings.include_personal_info) {
      filtered_vacation.participants = 0
      delete filtered_vacation.budget
    }

    const filtered_activities = activities.map(activity => {
      const filtered_activity = { ...activity }
      delete (filtered_activity as any).id
      delete (filtered_activity as any).vacation_id

      // Remove costs if not included
      if (!settings.include_costs) {
        delete filtered_activity.cost
      }

      // Remove notes if not included
      if (!settings.include_notes) {
        delete filtered_activity.notes
      }

      return filtered_activity
    })

    const expires_at = settings.expires_in_days 
      ? new Date(Date.now() + settings.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    return {
      vacation: filtered_vacation,
      activities: filtered_activities,
      shared_at: new Date().toISOString(),
      shared_by: 'user', // In production, use actual user ID
      share_id: this.generate_share_id(),
      expires_at,
      view_count: 0,
      is_public: !settings.require_password
    }
  }

  private encode_share_data = (data: SharedVacationData): string => {
    try {
      return btoa(JSON.stringify(data))
    } catch {
      throw new Error('Failed to encode share data')
    }
  }

  private decode_share_data = (encoded: string): SharedVacationData => {
    try {
      return JSON.parse(atob(encoded))
    } catch {
      throw new Error('Invalid share data')
    }
  }

  private store_shared_vacation = (
    share_id: string, 
    data: SharedVacationData, 
    settings: ShareSettings
  ): void => {
    try {
      localStorage.setItem(`shared_${share_id}`, JSON.stringify(data))
      
      // Store settings separately
      localStorage.setItem(`shared_settings_${share_id}`, JSON.stringify(settings))
    } catch {
      throw new Error('Failed to store shared vacation')
    }
  }

  private generate_share_id = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  private generate_short_id = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private generate_id = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Validation helpers
  validate_share_id = (share_id: string): boolean => {
    return /^[a-zA-Z0-9]{10,20}$/.test(share_id)
  }

  is_share_expired = (shared_data: SharedVacationData): boolean => {
    if (!shared_data.expires_at) return false
    return new Date(shared_data.expires_at) < new Date()
  }
}

// Singleton instance
export const sharing_service = new SharingService()