import React, { useState } from 'react'
import { Vacation, VacationActivity } from '../../stores/vacation_store'
import { export_service, PrintSettings } from '../../services/export_service'
import { pdf_service, PDFOptions } from '../../services/pdf_service'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ExportModalProps {
  vacation: Vacation
  activities: VacationActivity[]
  is_open: boolean
  on_close: () => void
}

export const ExportModal: React.FC<ExportModalProps> = ({
  vacation,
  activities,
  is_open,
  on_close
}) => {
  const [export_type, set_export_type] = useState<'json' | 'pdf' | 'print' | 'calendar'>('json')
  const [print_settings, set_print_settings] = useState<PrintSettings>({
    include_costs: true,
    include_notes: true,
    include_locations: true,
    group_by_day: true,
    show_timeline: true,
    paper_size: 'A4',
    orientation: 'portrait'
  })
  const [pdf_options, set_pdf_options] = useState<PDFOptions>({
    format: 'A4',
    orientation: 'portrait',
    include_images: true,
    quality: 'high'
  })
  const [exporting, set_exporting] = useState(false)
  const [export_message, set_export_message] = useState('')

  if (!is_open) return null

  const handle_export = async () => {
    set_exporting(true)
    set_export_message('')

    try {
      switch (export_type) {
        case 'json':
          export_service.export_json(vacation, activities)
          set_export_message('קובץ JSON הורד בהצלחה')
          break

        case 'pdf':
          await pdf_service.generate_pdf(vacation, activities, print_settings, pdf_options)
          set_export_message('PDF נוצר בהצלחה - בחר "שמור כ-PDF" בחלון ההדפסה')
          break

        case 'print':
          export_service.print_vacation(vacation, activities, print_settings)
          set_export_message('חלון ההדפסה נפתח')
          break

        case 'calendar':
          export_service.export_calendar(vacation, activities)
          set_export_message('קובץ לוח שנה הורד בהצלחה')
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      set_export_message('שגיאה בייצוא הקובץ')
    } finally {
      set_exporting(false)
    }
  }

  const total_cost = activities.reduce((sum, act) => sum + (act.cost || 0), 0)
  const duration_days = Math.ceil(
    (new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) / (1000 * 60 * 60 * 24)
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
          <h3 className="text-lg font-semibold text-gray-900">ייצוא תכנית חופשה</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Vacation Preview */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <h4 className="font-semibold text-gray-900">{vacation.title}</h4>
                <p className="text-gray-600">📍 {vacation.destination}</p>
                <p className="text-gray-600">📅 {vacation.start_date} - {vacation.end_date}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">👥 {vacation.participants} משתתפים</p>
                <p className="text-gray-600">🎯 {activities.length} פעילויות</p>
                <p className="text-gray-600">⏱️ {duration_days} ימים</p>
              </div>
            </div>
          </Card>

          {/* Export Type Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">בחר סוג ייצוא</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => set_export_type('json')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  export_type === 'json'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📁</div>
                <div className="text-sm font-medium">JSON</div>
                <div className="text-xs text-gray-500">קובץ נתונים</div>
              </button>

              <button
                onClick={() => set_export_type('pdf')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  export_type === 'pdf'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm font-medium">PDF</div>
                <div className="text-xs text-gray-500">מסמך מעוצב</div>
              </button>

              <button
                onClick={() => set_export_type('print')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  export_type === 'print'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🖨️</div>
                <div className="text-sm font-medium">הדפסה</div>
                <div className="text-xs text-gray-500">הדפסה ישירה</div>
              </button>

              <button
                onClick={() => set_export_type('calendar')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  export_type === 'calendar'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm font-medium">לוח שנה</div>
                <div className="text-xs text-gray-500">ICS קובץ</div>
              </button>
            </div>
          </div>

          {/* Export Settings */}
          {(export_type === 'pdf' || export_type === 'print') && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">הגדרות ייצוא</h4>
              
              {/* Content Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">תוכן לכלול</h5>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={print_settings.include_costs}
                      onChange={(e) => set_print_settings(prev => ({ ...prev, include_costs: e.target.checked }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">עלויות</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={print_settings.include_notes}
                      onChange={(e) => set_print_settings(prev => ({ ...prev, include_notes: e.target.checked }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">הערות</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={print_settings.include_locations}
                      onChange={(e) => set_print_settings(prev => ({ ...prev, include_locations: e.target.checked }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">מיקומים</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={print_settings.show_timeline}
                      onChange={(e) => set_print_settings(prev => ({ ...prev, show_timeline: e.target.checked }))}
                      className="text-blue-600"
                    />
                    <span className="text-sm">זמנים</span>
                  </label>
                </div>
              </div>

              {/* Format Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">פורמט</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">גודל נייר</label>
                    <select
                      value={print_settings.paper_size}
                      onChange={(e) => set_print_settings(prev => ({ ...prev, paper_size: e.target.value as 'A4' | 'Letter' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">כיוון</label>
                    <select
                      value={print_settings.orientation}
                      onChange={(e) => set_print_settings(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="portrait">לאורך</option>
                      <option value="landscape">לרוחב</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Description */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              {export_type === 'json' && 'ייצוא JSON'}
              {export_type === 'pdf' && 'יצירת PDF'}
              {export_type === 'print' && 'הדפסה'}
              {export_type === 'calendar' && 'ייצוא ללוח שנה'}
            </h4>
            <p className="text-sm text-blue-800">
              {export_type === 'json' && 'קובץ JSON מכיל את כל נתוני החופשה בפורמט שניתן לייבא בחזרה או לשתף עם אחרים'}
              {export_type === 'pdf' && 'מסמך PDF מעוצב הכולל את תכנית החופשה המלאה עם עמוד כיסוי וסיכום'}
              {export_type === 'print' && 'הדפסה ישירה של תכנית החופשה בפורמט מותאם להדפסה'}
              {export_type === 'calendar' && 'קובץ ICS שניתן לייבא ללוח שנה (Google, Outlook, Apple Calendar)'}
            </p>
          </div>

          {/* Export Message */}
          {export_message && (
            <div className={`p-3 rounded-lg ${
              export_message.includes('שגיאה') 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {export_message}
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
              onClick={handle_export}
              disabled={exporting}
              className="flex-1"
            >
              {exporting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  מייצא...
                </div>
              ) : (
                <>
                  {export_type === 'json' && '💾 ייצא JSON'}
                  {export_type === 'pdf' && '📄 צור PDF'}
                  {export_type === 'print' && '🖨️ הדפס'}
                  {export_type === 'calendar' && '📅 ייצא ללוח שנה'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}