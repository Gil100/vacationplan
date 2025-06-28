import React, { useState } from 'react'
import { Vacation, VacationActivity } from '../../stores/vacation_store'
import { sharing_service, ShareSettings } from '../../services/sharing_service'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface EmailSharingModalProps {
  vacation: Vacation
  activities: VacationActivity[]
  is_open: boolean
  on_close: () => void
}

export const EmailSharingModal: React.FC<EmailSharingModalProps> = ({
  vacation,
  activities,
  is_open,
  on_close
}) => {
  const [share_method, set_share_method] = useState<'email' | 'whatsapp' | 'link'>('email')
  const [share_settings, set_share_settings] = useState<ShareSettings>({
    include_costs: true,
    include_notes: false,
    include_personal_info: true,
    allow_copying: true,
    expires_in_days: 30
  })
  const [email_recipients, set_email_recipients] = useState('')
  const [custom_message, set_custom_message] = useState('')
  const [share_link, set_share_link] = useState('')
  const [copying, set_copying] = useState(false)

  if (!is_open) return null

  const handle_create_share_link = () => {
    const link = sharing_service.create_shareable_link(vacation, activities, share_settings)
    set_share_link(link)
  }

  const handle_copy_link = async () => {
    if (!share_link) {
      handle_create_share_link()
    }
    
    try {
      await navigator.clipboard.writeText(share_link)
      set_copying(true)
      setTimeout(() => set_copying(false), 2000)
    } catch {
      // Fallback for older browsers
      const text_area = document.createElement('textarea')
      text_area.value = share_link
      document.body.appendChild(text_area)
      text_area.select()
      document.execCommand('copy')
      document.body.removeChild(text_area)
      set_copying(true)
      setTimeout(() => set_copying(false), 2000)
    }
  }

  const handle_send_email = () => {
    const link = share_link || sharing_service.create_shareable_link(vacation, activities, share_settings)
    sharing_service.send_email(vacation, activities, link)
  }

  const handle_send_whatsapp = () => {
    const link = share_link || sharing_service.create_shareable_link(vacation, activities, share_settings)
    sharing_service.share_whatsapp(vacation, activities, link)
  }

  const { subject, body } = sharing_service.create_email_content(
    vacation, 
    activities, 
    share_link || 'קישור יווצר בשליחה'
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={on_close}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900">שליחת תכנית חופשה</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Vacation Preview */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{vacation.title}</h4>
              <p className="text-gray-600 mb-1">📍 {vacation.destination}</p>
              <p className="text-gray-600 mb-1">📅 {vacation.start_date} - {vacation.end_date}</p>
              <p className="text-gray-600">🎯 {activities.length} פעילויות מתוכננות</p>
            </div>
          </Card>

          {/* Sharing Method */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">אופן שליחה</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => set_share_method('email')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  share_method === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📧</div>
                <div className="text-sm font-medium">אימייל</div>
              </button>
              
              <button
                onClick={() => set_share_method('whatsapp')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  share_method === 'whatsapp'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium">WhatsApp</div>
              </button>
              
              <button
                onClick={() => set_share_method('link')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  share_method === 'link'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="text-sm font-medium">קישור</div>
              </button>
            </div>
          </div>

          {/* Share Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">הגדרות שיתוף</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={share_settings.include_costs}
                    onChange={(e) => set_share_settings(prev => ({ ...prev, include_costs: e.target.checked }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">כלול עלויות</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={share_settings.include_notes}
                    onChange={(e) => set_share_settings(prev => ({ ...prev, include_notes: e.target.checked }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">כלול הערות</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={share_settings.include_personal_info}
                    onChange={(e) => set_share_settings(prev => ({ ...prev, include_personal_info: e.target.checked }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">מידע אישי</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={share_settings.allow_copying}
                    onChange={(e) => set_share_settings(prev => ({ ...prev, allow_copying: e.target.checked }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">אפשר העתקה</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תפוגת קישור</label>
                <select
                  value={share_settings.expires_in_days || 30}
                  onChange={(e) => set_share_settings(prev => ({ 
                    ...prev, 
                    expires_in_days: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7">שבוע</option>
                  <option value="30">חודש</option>
                  <option value="90">3 חודשים</option>
                  <option value="">ללא תפוגה</option>
                </select>
              </div>
            </div>
          </div>

          {/* Method-specific content */}
          {share_method === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">נמענים (אופציונלי)</label>
                <input
                  type="email"
                  value={email_recipients}
                  onChange={(e) => set_email_recipients(e.target.value)}
                  placeholder="email@example.com, email2@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">הפרד כתובות מרובות בפסיק</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הודעה מותאמת אישית</label>
                <textarea
                  value={custom_message}
                  onChange={(e) => set_custom_message(e.target.value)}
                  placeholder="הוסף הודעה אישית..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
                />
              </div>

              {/* Email Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">תצוגה מקדימה של האימייל</h5>
                <div className="text-sm space-y-2">
                  <div><strong>נושא:</strong> {subject}</div>
                  <div><strong>תוכן:</strong></div>
                  <div className="bg-white p-3 rounded border text-xs whitespace-pre-line max-h-32 overflow-y-auto">
                    {custom_message && `${custom_message}\n\n`}{body}
                  </div>
                </div>
              </div>
            </div>
          )}

          {share_method === 'whatsapp' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">שליחה ב-WhatsApp</h4>
              <p className="text-sm text-green-800 mb-3">
                תיפתח אפליקציית WhatsApp עם הודעה מוכנה הכוללת את פרטי החופשה וקישור לצפייה
              </p>
              <div className="text-xs text-green-700 bg-white p-3 rounded border max-h-32 overflow-y-auto whitespace-pre-line">
                {body}
              </div>
            </div>
          )}

          {share_method === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">קישור לשיתוף</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={share_link || 'יווצר בלחיצה על "צור קישור"'}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    dir="ltr"
                  />
                  <Button
                    onClick={share_link ? handle_copy_link : handle_create_share_link}
                    variant={copying ? "primary" : "outline"}
                    size="sm"
                  >
                    {copying ? '✓ הועתק' : share_link ? 'העתק' : 'צור קישור'}
                  </Button>
                </div>
              </div>

              {share_link && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">פרטי הקישור</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• הקישור יהיה זמין למשך {share_settings.expires_in_days || 'ללא הגבלת'} ימים</p>
                    <p>• {share_settings.allow_copying ? 'מאפשר' : 'לא מאפשר'} העתקה של התכנית</p>
                    <p>• {share_settings.include_costs ? 'כולל' : 'לא כולל'} מידע על עלויות</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={on_close}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (share_method === 'email') handle_send_email()
                else if (share_method === 'whatsapp') handle_send_whatsapp()
                else handle_copy_link()
              }}
              className="flex-1"
            >
              {share_method === 'email' && '📧 שלח באימייל'}
              {share_method === 'whatsapp' && '💬 שלח ב-WhatsApp'}
              {share_method === 'link' && (share_link ? '🔗 העתק קישור' : '🔗 צור קישור')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}