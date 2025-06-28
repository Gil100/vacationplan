/**
 * Enhanced storage service with backup/restore functionality
 */

export interface BackupData {
  version: string
  created_at: string
  data: {
    vacations: any[]
    activities: any[]
    user_preferences: any
    favorite_activities: any[]
    vacation_templates: any[]
  }
  metadata: {
    total_vacations: number
    total_activities: number
    app_version: string
  }
}

export interface StorageStats {
  total_size: number
  vacation_count: number
  activity_count: number
  last_backup: string | null
  storage_usage_mb: number
}

export class StorageService {
  private readonly STORAGE_PREFIX = 'vacationplan_'
  private readonly BACKUP_KEY = 'backup_data'
  private readonly VERSION = '1.0.0'

  // Get storage statistics
  get_storage_stats = (): StorageStats => {
    const vacation_data = this.get_item('vacation-storage')
    const backup_data = this.get_item(this.BACKUP_KEY)
    
    let total_size = 0
    for (let key in localStorage) {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        total_size += localStorage[key].length
      }
    }

    return {
      total_size,
      vacation_count: vacation_data?.state?.vacations?.length || 0,
      activity_count: vacation_data?.state?.activities?.length || 0,
      last_backup: backup_data?.created_at || null,
      storage_usage_mb: total_size / (1024 * 1024)
    }
  }

  // Create complete backup
  create_backup = (): BackupData => {
    const vacation_data = this.get_item('vacation-storage')
    const user_preferences = this.get_item('user_preferences')
    const favorite_activities = this.get_item('favorite_activities')
    const vacation_templates = this.get_item('vacation_templates')

    const backup: BackupData = {
      version: this.VERSION,
      created_at: new Date().toISOString(),
      data: {
        vacations: vacation_data?.state?.vacations || [],
        activities: vacation_data?.state?.activities || [],
        user_preferences: user_preferences || {},
        favorite_activities: favorite_activities || [],
        vacation_templates: vacation_templates || []
      },
      metadata: {
        total_vacations: vacation_data?.state?.vacations?.length || 0,
        total_activities: vacation_data?.state?.activities?.length || 0,
        app_version: this.VERSION
      }
    }

    // Save backup to local storage
    this.set_item(this.BACKUP_KEY, backup)
    
    return backup
  }

  // Export backup as downloadable file
  export_backup = (): string => {
    const backup = this.create_backup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const filename = `vacation_backup_${new Date().toISOString().split('T')[0]}.json`
    
    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return filename
  }

  // Import backup from file
  import_backup = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const content = await this.read_file_as_text(file)
      const backup_data: BackupData = JSON.parse(content)
      
      // Validate backup structure
      if (!this.validate_backup(backup_data)) {
        return { success: false, message: 'קובץ הגיבוי פגום או לא תקין' }
      }

      // Create current backup before restoration
      this.create_backup()
      
      // Restore data
      await this.restore_from_backup(backup_data)
      
      return { 
        success: true, 
        message: `גיבוי שוחזר בהצלחה (${backup_data.metadata.total_vacations} חופשות, ${backup_data.metadata.total_activities} פעילויות)` 
      }
      
    } catch (error) {
      console.error('Backup import error:', error)
      return { success: false, message: 'שגיאה בקריאת קובץ הגיבוי' }
    }
  }

  // Restore from backup data
  restore_from_backup = async (backup: BackupData): Promise<void> => {
    // Restore vacation data
    if (backup.data.vacations && backup.data.activities) {
      const vacation_storage = {
        state: {
          vacations: backup.data.vacations,
          activities: backup.data.activities
        },
        version: 0
      }
      this.set_item('vacation-storage', vacation_storage)
    }

    // Restore other data
    if (backup.data.user_preferences) {
      this.set_item('user_preferences', backup.data.user_preferences)
    }
    
    if (backup.data.favorite_activities) {
      this.set_item('favorite_activities', backup.data.favorite_activities)
    }
    
    if (backup.data.vacation_templates) {
      this.set_item('vacation_templates', backup.data.vacation_templates)
    }

    // Trigger storage event to update components
    window.dispatchEvent(new Event('storage'))
  }

  // Clear all app data
  clear_all_data = (): void => {
    const keys_to_remove: string[] = []
    
    for (let key in localStorage) {
      if (key.startsWith(this.STORAGE_PREFIX) || 
          key === 'vacation-storage' || 
          key === 'user_preferences' ||
          key === 'favorite_activities' ||
          key === 'vacation_templates') {
        keys_to_remove.push(key)
      }
    }
    
    keys_to_remove.forEach(key => localStorage.removeItem(key))
    window.dispatchEvent(new Event('storage'))
  }

  // Validate backup structure
  private validate_backup = (backup: any): backup is BackupData => {
    return (
      backup &&
      typeof backup.version === 'string' &&
      typeof backup.created_at === 'string' &&
      backup.data &&
      Array.isArray(backup.data.vacations) &&
      Array.isArray(backup.data.activities) &&
      backup.metadata &&
      typeof backup.metadata.total_vacations === 'number'
    )
  }

  // Read file as text
  private read_file_as_text = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  // Helper methods for localStorage operations
  private get_item = (key: string): any => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  private set_item = (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage error:', error)
      throw new Error('שגיאה בשמירת נתונים')
    }
  }

  // Data migration utilities
  migrate_data = (from_version: string, to_version: string): void => {
    console.log(`Migrating data from ${from_version} to ${to_version}`)
    // Future migration logic would go here
  }

  // Auto-backup functionality
  setup_auto_backup = (interval_hours: number = 24): void => {
    const interval_ms = interval_hours * 60 * 60 * 1000
    
    setInterval(() => {
      try {
        this.create_backup()
        console.log('Auto-backup created successfully')
      } catch (error) {
        console.error('Auto-backup failed:', error)
      }
    }, interval_ms)
  }

  // Compress data before storage (for future use)
  private compress_data = (data: any): string => {
    // Simple compression - in production, use a proper compression library
    return JSON.stringify(data)
  }

  private decompress_data = (compressed: string): any => {
    return JSON.parse(compressed)
  }
}

// Singleton instance
export const storage_service = new StorageService()