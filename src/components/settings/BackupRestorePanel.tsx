import React, { useState, useRef } from 'react'
import { storage_service, StorageStats } from '../../services/storage_service'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { format_currency } from '../../utils/currency_utils'

export const BackupRestorePanel: React.FC = () => {
  const [storage_stats, set_storage_stats] = useState<StorageStats | null>(null)
  const [backup_status, set_backup_status] = useState<'idle' | 'creating' | 'success' | 'error'>('idle')
  const [restore_status, set_restore_status] = useState<'idle' | 'restoring' | 'success' | 'error'>('idle')
  const [message, set_message] = useState('')
  const file_input_ref = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    load_storage_stats()
  }, [])

  const load_storage_stats = () => {
    const stats = storage_service.get_storage_stats()
    set_storage_stats(stats)
  }

  const handle_create_backup = async () => {
    set_backup_status('creating')
    try {
      const filename = storage_service.export_backup()
      set_backup_status('success')
      set_message(`גיבוי נוצר בהצלחה: ${filename}`)
      load_storage_stats()
    } catch (error) {
      set_backup_status('error')
      set_message('שגיאה ביצירת הגיבוי')
    }
  }

  const handle_restore_backup = async (file: File) => {
    set_restore_status('restoring')
    try {
      const result = await storage_service.import_backup(file)
      if (result.success) {
        set_restore_status('success')
        set_message(result.message)
        load_storage_stats()
        // Refresh page to reflect restored data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        set_restore_status('error')
        set_message(result.message)
      }
    } catch (error) {
      set_restore_status('error')
      set_message('שגיאה בשחזור הגיבוי')
    }
  }

  const handle_file_select = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handle_restore_backup(file)
    }
  }

  const handle_clear_data = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו לא ניתנת לביטול.')) {
      storage_service.clear_all_data()
      set_message('כל הנתונים נמחקו בהצלחה')
      load_storage_stats()
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  const format_file_size = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const format_date = (date_string: string | null): string => {
    if (!date_string) return 'אף פעם'
    return new Date(date_string).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Storage Statistics */}
      {storage_stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">סטטיסטיקות אחסון</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{storage_stats.vacation_count}</div>
              <div className="text-sm text-blue-800">חופשות</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{storage_stats.activity_count}</div>
              <div className="text-sm text-green-800">פעילויות</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {format_file_size(storage_stats.total_size)}
              </div>
              <div className="text-sm text-purple-800">גודל נתונים</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xs font-bold text-orange-600">
                {format_date(storage_stats.last_backup)}
              </div>
              <div className="text-sm text-orange-800">גיבוי אחרון</div>
            </div>
          </div>
        </Card>
      )}

      {/* Backup Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">יצירת גיבוי</h3>
        <p className="text-gray-600 mb-4">
          צור גיבוי של כל הנתונים שלך כולל חופשות, פעילויות והעדפות אישיות
        </p>
        
        <Button
          onClick={handle_create_backup}
          disabled={backup_status === 'creating'}
          variant="primary"
          className="w-full sm:w-auto"
        >
          {backup_status === 'creating' ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              יוצר גיבוי...
            </div>
          ) : (
            '💾 צור גיבוי'
          )}
        </Button>

        {backup_status === 'success' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">✅ {message}</p>
          </div>
        )}
      </Card>

      {/* Restore Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">שחזור גיבוי</h3>
        <p className="text-gray-600 mb-4">
          שחזר נתונים מקובץ גיבוי קיים. הנתונים הנוכחיים ייגבו אוטומטית לפני השחזור
        </p>

        <input
          ref={file_input_ref}
          type="file"
          accept=".json"
          onChange={handle_file_select}
          className="hidden"
        />

        <Button
          onClick={() => file_input_ref.current?.click()}
          disabled={restore_status === 'restoring'}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {restore_status === 'restoring' ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              משחזר...
            </div>
          ) : (
            '📁 בחר קובץ גיבוי'
          )}
        </Button>

        {(restore_status === 'success' || restore_status === 'error') && (
          <div className={`mt-3 p-3 border rounded-lg ${
            restore_status === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              restore_status === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {restore_status === 'success' ? '✅' : '❌'} {message}
            </p>
          </div>
        )}
      </Card>

      {/* Auto-backup Info */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">גיבוי אוטומטי</h3>
        <p className="text-blue-800 text-sm mb-3">
          הנתונים שלך נשמרים אוטומטיות בזיכרון המקומי של הדפדפן. 
          מומלץ ליצור גיבוי ידני מדי פעם למקרה של מחיקת נתוני דפדפן.
        </p>
        <div className="text-xs text-blue-700">
          <p>• הנתונים נשמרים רק במכשיר זה</p>
          <p>• מחיקת נתוני דפדפן תמחק את הנתונים</p>
          <p>• גיבוי ידני מאפשר העברה בין מכשירים</p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-2">אזור סכנה</h3>
        <p className="text-red-800 text-sm mb-4">
          פעולות אלו אינן ניתנות לביטול. ודא שיש לך גיבוי לפני ביצוען.
        </p>
        <Button
          onClick={handle_clear_data}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          🗑️ מחק את כל הנתונים
        </Button>
      </Card>
    </div>
  )
}