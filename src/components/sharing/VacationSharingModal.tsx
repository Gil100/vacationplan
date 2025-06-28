import React, { useState } from 'react'
import { Vacation } from '../../stores/vacation_store'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { QRCodeSVG } from 'qrcode.react'

interface VacationSharingModalProps {
  vacation: Vacation
  is_open: boolean
  on_close: () => void
}

export const VacationSharingModal: React.FC<VacationSharingModalProps> = ({
  vacation,
  is_open,
  on_close
}) => {
  const [sharing_method, set_sharing_method] = useState<'link' | 'export' | 'whatsapp'>('link')
  const [share_link, set_share_link] = useState('')
  const [copied, set_copied] = useState(false)

  if (!is_open) return null

  // Generate shareable link (mock implementation)
  const generate_share_link = () => {
    const vacation_data = {
      id: vacation.id,
      title: vacation.title,
      destination: vacation.destination,
      start_date: vacation.start_date,
      end_date: vacation.end_date,
      participants: vacation.participants
    }
    
    const encoded_data = btoa(JSON.stringify(vacation_data))
    const base_url = window.location.origin
    return `${base_url}/shared/${encoded_data}`
  }

  const handle_copy_link = async () => {
    const link = generate_share_link()
    set_share_link(link)
    
    try {
      await navigator.clipboard.writeText(link)
      set_copied(true)
      setTimeout(() => set_copied(false), 2000)
    } catch {
      // Fallback for older browsers
      const text_area = document.createElement('textarea')
      text_area.value = link
      document.body.appendChild(text_area)
      text_area.select()
      document.execCommand('copy')
      document.body.removeChild(text_area)
      set_copied(true)
      setTimeout(() => set_copied(false), 2000)
    }
  }

  const handle_whatsapp_share = () => {
    const link = generate_share_link()
    const message = `🌴 תכנית החופשה שלי: ${vacation.title}\n📍 יעד: ${vacation.destination}\n📅 תאריכים: ${vacation.start_date} - ${vacation.end_date}\n\nצפו בתכנית המלאה: ${link}`
    const whatsapp_url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsapp_url, '_blank')
  }

  const handle_export_json = () => {
    const vacation_export = {
      vacation,
      exported_at: new Date().toISOString(),
      app_version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(vacation_export, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${vacation.title.replace(/\s+/g, '_')}_vacation_plan.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const vacation_url = share_link || generate_share_link()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
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
          <h3 className="text-lg font-semibold text-gray-900">שיתוף חופשה</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Vacation Preview */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{vacation.title}</h4>
              <p className="text-gray-600 mb-1">📍 {vacation.destination}</p>
              <p className="text-gray-600 mb-1">📅 {vacation.start_date} - {vacation.end_date}</p>
              <p className="text-gray-600">👥 {vacation.participants} משתתפים</p>
            </div>
          </Card>

          {/* Sharing Method Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">בחר אופן שיתוף</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => set_sharing_method('link')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  sharing_method === 'link'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="text-sm font-medium">קישור</div>
              </button>
              
              <button
                onClick={() => set_sharing_method('whatsapp')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  sharing_method === 'whatsapp'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium">WhatsApp</div>
              </button>
              
              <button
                onClick={() => set_sharing_method('export')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  sharing_method === 'export'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📁</div>
                <div className="text-sm font-medium">ייצוא</div>
              </button>
            </div>
          </div>

          {/* Sharing Content */}
          {sharing_method === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קישור לשיתוף
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vacation_url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    dir="ltr"
                  />
                  <Button
                    onClick={handle_copy_link}
                    variant={copied ? "primary" : "outline"}
                    size="sm"
                  >
                    {copied ? '✓ הועתק' : 'העתק'}
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">סרוק עם המצלמה לפתיחה במכשיר אחר</p>
                <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                  <QRCodeSVG value={vacation_url} size={150} />
                </div>
              </div>
            </div>
          )}

          {sharing_method === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">הודעת WhatsApp</h4>
                <p className="text-sm text-green-800">
                  🌴 תכנית החופשה שלי: {vacation.title}<br/>
                  📍 יעד: {vacation.destination}<br/>
                  📅 תאריכים: {vacation.start_date} - {vacation.end_date}<br/>
                  <br/>
                  צפו בתכנית המלאה: {vacation_url}
                </p>
              </div>
              <Button
                onClick={handle_whatsapp_share}
                variant="primary"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                📱 שלח ב-WhatsApp
              </Button>
            </div>
          )}

          {sharing_method === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">ייצוא קובץ</h4>
                <p className="text-sm text-purple-800 mb-3">
                  יצא את תכנית החופשה כקובץ JSON שניתן לייבא באפליקציות אחרות או לגבות
                </p>
                <div className="text-xs text-purple-700">
                  <p>• כולל את כל פרטי החופשה והפעילויות</p>
                  <p>• ניתן לייבא בחזרה לאפליקציה</p>
                  <p>• פורמט פתוח לשימוש בכלים אחרים</p>
                </div>
              </div>
              <Button
                onClick={handle_export_json}
                variant="primary"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                💾 ייצא כקובץ JSON
              </Button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">🔒 פרטיות ואבטחה</p>
            <p>הקישור כולל את פרטי החופשה בצורה מקודדת. שתף רק עם אנשים שאתה סומך עליהם.</p>
          </div>
        </div>
      </div>
    </div>
  )
}