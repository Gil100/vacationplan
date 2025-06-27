import React, { useState } from 'react'
import { Button, Input, Card } from '../ui'
import { use_vacation_store } from '../../stores/vacation_store'
import { use_translation } from '../../hooks/use_translation'

interface VacationCreateModalProps {
  on_close: () => void
}

const VacationCreateModal: React.FC<VacationCreateModalProps> = ({ on_close }) => {
  const { t } = use_translation()
  const { add_vacation } = use_vacation_store()
  const [loading, set_loading] = useState(false)
  const [form_data, set_form_data] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    participants: 2,
    budget: '',
    description: ''
  })

  const [errors, set_errors] = useState<Record<string, string>>({})

  const validate_form = () => {
    const new_errors: Record<string, string> = {}

    if (!form_data.title.trim()) {
      new_errors.title = 'שם החופשה הוא שדה חובה'
    }

    if (!form_data.destination.trim()) {
      new_errors.destination = 'יעד החופשה הוא שדה חובה'
    }

    if (!form_data.start_date) {
      new_errors.start_date = 'תאריך התחלה הוא שדה חובה'
    }

    if (!form_data.end_date) {
      new_errors.end_date = 'תאריך סיום הוא שדה חובה'
    }

    if (form_data.start_date && form_data.end_date) {
      if (new Date(form_data.start_date) >= new Date(form_data.end_date)) {
        new_errors.end_date = 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה'
      }
    }

    if (form_data.participants < 1) {
      new_errors.participants = 'מספר המשתתפים חייב להיות לפחות 1'
    }

    set_errors(new_errors)
    return Object.keys(new_errors).length === 0
  }

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate_form()) {
      return
    }

    set_loading(true)
    try {
      await add_vacation({
        title: form_data.title.trim(),
        destination: form_data.destination.trim(),
        start_date: form_data.start_date,
        end_date: form_data.end_date,
        participants: form_data.participants,
        budget: form_data.budget ? parseFloat(form_data.budget) : undefined,
        description: form_data.description.trim() || undefined,
        status: 'draft'
      })
      on_close()
    } catch (error) {
      console.error('Error creating vacation:', error)
    } finally {
      set_loading(false)
    }
  }

  const handle_change = (field: string, value: string | number) => {
    set_form_data(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      set_errors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const popular_destinations = [
    'תל אביב', 'ירושלים', 'אילת', 'טבריה', 'נתניה', 
    'באר שבע', 'הרצליה', 'אשדוד', 'חיפה', 'ראשון לציון'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('vacation.new_vacation')}
            </h2>
            <button
              onClick={on_close}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handle_submit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vacation.vacation_name')} *
              </label>
              <Input
                value={form_data.title}
                onChange={(e) => handle_change('title', e.target.value)}
                placeholder="למשל: חופשת קיץ 2025"
                error={errors.title}
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vacation.destination')} *
              </label>
              <Input
                value={form_data.destination}
                onChange={(e) => handle_change('destination', e.target.value)}
                placeholder="בחרו יעד או הקלידו בעצמכם"
                error={errors.destination}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {popular_destinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => handle_change('destination', dest)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vacation.start_date')} *
                </label>
                <Input
                  type="date"
                  value={form_data.start_date}
                  onChange={(e) => handle_change('start_date', e.target.value)}
                  error={errors.start_date}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vacation.end_date')} *
                </label>
                <Input
                  type="date"
                  value={form_data.end_date}
                  onChange={(e) => handle_change('end_date', e.target.value)}
                  error={errors.end_date}
                />
              </div>
            </div>

            {/* Participants and Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vacation.participants')} *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={form_data.participants}
                  onChange={(e) => handle_change('participants', parseInt(e.target.value) || 1)}
                  error={errors.participants}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vacation.budget')} (₪)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form_data.budget}
                  onChange={(e) => handle_change('budget', e.target.value)}
                  placeholder="אופציונלי"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור החופשה
              </label>
              <textarea
                value={form_data.description}
                onChange={(e) => handle_change('description', e.target.value)}
                placeholder="תארו את החופשה שלכם..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                {loading ? 'יוצר...' : 'צור חופשה'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={on_close}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default VacationCreateModal