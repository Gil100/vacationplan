import React, { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui'

interface FormData {
  vacation_name: string
  destination: string
  participants: string
  description: string
  email: string
}

export const HebrewTestForm: React.FC = () => {
  const [form_data, set_form_data] = useState<FormData>({
    vacation_name: '',
    destination: '',
    participants: '',
    description: '',
    email: ''
  })
  
  const [errors, set_errors] = useState<Partial<FormData>>({})
  const [submitted, set_submitted] = useState(false)

  const handle_change = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    set_form_data(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      set_errors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validate_form = (): boolean => {
    const new_errors: Partial<FormData> = {}
    
    if (!form_data.vacation_name.trim()) {
      new_errors.vacation_name = 'שם החופשה הוא שדה חובה'
    }
    
    if (!form_data.destination.trim()) {
      new_errors.destination = 'יעד החופשה הוא שדה חובה'
    }
    
    if (!form_data.participants.trim()) {
      new_errors.participants = 'מספר המשתתפים הוא שדה חובה'
    } else if (isNaN(Number(form_data.participants))) {
      new_errors.participants = 'מספר המשתתפים חייב להיות מספר'
    }
    
    if (form_data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form_data.email)) {
      new_errors.email = 'כתובת אימייל לא תקינה'
    }

    set_errors(new_errors)
    return Object.keys(new_errors).length === 0
  }

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate_form()) {
      set_submitted(true)
      console.log('Form submitted:', form_data)
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent>
          <div className="text-center py-8">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <CardTitle level={2} className="text-green-600 mb-2">
              הטופס נשלח בהצלחה!
            </CardTitle>
            <p className="text-gray-600 hebrew-body">
              תודה על מילוי הטופס. נחזור אליך בהקדם.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-start">
              <h4 className="font-semibold mb-2">הפרטים שנשלחו:</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>שם החופשה:</strong> {form_data.vacation_name}</li>
                <li><strong>יעד:</strong> {form_data.destination}</li>
                <li><strong>מספר משתתפים:</strong> {form_data.participants}</li>
                {form_data.email && <li><strong>אימייל:</strong> {form_data.email}</li>}
                {form_data.description && <li><strong>תיאור:</strong> {form_data.description}</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle level={2}>
          טופס בדיקת עברית ו-RTL
        </CardTitle>
        <p className="text-gray-600 hebrew-body mt-2">
          טופס זה נועד לבדוק את תמיכת המערכת בטקסט עברי וממשק RTL
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handle_submit} className="space-y-6">
          <Input
            label="שם החופשה"
            placeholder="למשל: חופשה משפחתית בירושלים"
            value={form_data.vacation_name}
            onChange={handle_change('vacation_name')}
            error={errors.vacation_name}
            required
          />
          
          <Input
            label="יעד החופשה"
            placeholder="למשל: ירושלים, תל אביב, אילת"
            value={form_data.destination}
            onChange={handle_change('destination')}
            error={errors.destination}
            required
          />
          
          <Input
            label="מספר משתתפים"
            type="number"
            placeholder="4"
            value={form_data.participants}
            onChange={handle_change('participants')}
            error={errors.participants}
            help_text="כמה אנשים ישתתפו בחופשה?"
            required
          />
          
          <Input
            label="כתובת אימייל (אופציונלי)"
            type="email"
            placeholder="example@gmail.com"
            value={form_data.email}
            onChange={handle_change('email')}
            error={errors.email}
            help_text="נשתמש בכתובת זו ליצירת קשר"
          />
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              תיאור החופשה (אופציונלי)
            </label>
            <textarea
              id="description"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 hebrew-body"
              placeholder="ספרו לנו על החופשה שלכם... מה אתם רוצים לעשות? איפה אתם רוצים לבקר?"
              value={form_data.description}
              onChange={handle_change('description')}
              dir="rtl"
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              שלח טופס
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}