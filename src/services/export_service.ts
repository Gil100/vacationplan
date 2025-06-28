import { Vacation, VacationActivity } from '../stores/vacation_store'
import { format_currency } from '../utils/currency_utils'

export interface ExportData {
  vacation: Vacation
  activities: VacationActivity[]
  exported_at: string
  export_format: 'json' | 'pdf' | 'ics' | 'print'
  metadata: {
    app_version: string
    total_activities: number
    total_cost: number
    duration_days: number
  }
}

export interface PrintSettings {
  include_costs: boolean
  include_notes: boolean
  include_locations: boolean
  group_by_day: boolean
  show_timeline: boolean
  paper_size: 'A4' | 'Letter'
  orientation: 'portrait' | 'landscape'
}

export class ExportService {
  private readonly APP_VERSION = '1.0.0'

  // Export vacation as JSON
  export_json = (vacation: Vacation, activities: VacationActivity[]): string => {
    const export_data: ExportData = {
      vacation,
      activities,
      exported_at: new Date().toISOString(),
      export_format: 'json',
      metadata: {
        app_version: this.APP_VERSION,
        total_activities: activities.length,
        total_cost: activities.reduce((sum, act) => sum + (act.cost || 0), 0),
        duration_days: this.calculate_duration_days(vacation.start_date, vacation.end_date)
      }
    }

    const json_string = JSON.stringify(export_data, null, 2)
    
    // Create and download file
    this.download_file(
      json_string,
      `${vacation.title.replace(/\s+/g, '_')}_vacation.json`,
      'application/json'
    )

    return json_string
  }

  // Import vacation from JSON
  import_json = async (file: File): Promise<{ vacation: Vacation; activities: VacationActivity[] }> => {
    const content = await this.read_file_as_text(file)
    const data: ExportData = JSON.parse(content)

    // Validate structure
    if (!data.vacation || !Array.isArray(data.activities)) {
      throw new Error('קובץ לא תקין')
    }

    // Generate new IDs to avoid conflicts
    const new_vacation: Vacation = {
      ...data.vacation,
      id: this.generate_id(),
      title: `${data.vacation.title} (מועתק)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const new_activities: VacationActivity[] = data.activities.map(activity => ({
      ...activity,
      id: this.generate_id(),
      vacation_id: new_vacation.id
    }))

    return { vacation: new_vacation, activities: new_activities }
  }

  // Export as calendar (ICS format)
  export_calendar = (vacation: Vacation, activities: VacationActivity[]): string => {
    const ics_content = this.generate_ics_content(vacation, activities)
    
    this.download_file(
      ics_content,
      `${vacation.title.replace(/\s+/g, '_')}_calendar.ics`,
      'text/calendar'
    )

    return ics_content
  }

  // Generate printable HTML
  generate_printable_html = (
    vacation: Vacation, 
    activities: VacationActivity[], 
    settings: PrintSettings
  ): string => {
    const grouped_activities = this.group_activities_by_day(activities)
    const total_cost = activities.reduce((sum, act) => sum + (act.cost || 0), 0)
    
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>תכנית חופשה - ${vacation.title}</title>
    <style>
        @page {
            size: ${settings.paper_size} ${settings.orientation};
            margin: 2cm;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            text-align: right;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .vacation-title {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .vacation-details {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .day-section {
            page-break-inside: avoid;
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
        }
        
        .day-header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 12px 20px;
            margin: -20px -20px 20px -20px;
            border-radius: 8px 8px 0 0;
            font-size: 20px;
            font-weight: bold;
        }
        
        .activity {
            margin-bottom: 15px;
            padding: 15px;
            background: #f8fafc;
            border-right: 4px solid #3b82f6;
            border-radius: 4px;
        }
        
        .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .activity-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
        }
        
        .activity-time {
            font-size: 14px;
            color: #6b7280;
            background: #e0e7ff;
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        .activity-details {
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 5px;
        }
        
        .activity-cost {
            font-weight: bold;
            color: #059669;
        }
        
        .summary {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
            page-break-inside: avoid;
        }
        
        .summary-title {
            font-size: 20px;
            font-weight: bold;
            color: #0c4a6e;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .summary-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 6px;
        }
        
        .summary-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
        }
        
        .summary-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
        }
        
        @media print {
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }
        
        .category-badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 12px;
            margin-left: 8px;
        }
        
        .category-attraction { background: #dbeafe; color: #1e40af; }
        .category-restaurant { background: #dcfce7; color: #166534; }
        .category-accommodation { background: #f3e8ff; color: #7c3aed; }
        .category-transport { background: #fed7aa; color: #c2410c; }
        .category-activity { background: #fce7f3; color: #be185d; }
        .category-other { background: #f1f5f9; color: #475569; }
    </style>
</head>
<body>
    <div class="header">
        <div class="vacation-title">${vacation.title}</div>
        <div class="vacation-details">📍 יעד: ${vacation.destination}</div>
        <div class="vacation-details">📅 תאריכים: ${vacation.start_date} - ${vacation.end_date}</div>
        <div class="vacation-details">👥 משתתפים: ${vacation.participants}</div>
        ${settings.include_costs ? `<div class="vacation-details">💰 תקציב: ${format_currency(vacation.budget || 0)}</div>` : ''}
    </div>

    ${Object.entries(grouped_activities).map(([day, day_activities]) => `
        <div class="day-section">
            <div class="day-header">יום ${day}</div>
            ${day_activities.map(activity => `
                <div class="activity">
                    <div class="activity-header">
                        <div class="activity-title">
                            ${activity.title}
                            <span class="category-badge category-${activity.category}">
                                ${this.get_category_label(activity.category)}
                            </span>
                        </div>
                        ${settings.show_timeline && activity.start_time ? `
                            <div class="activity-time">${activity.start_time}${activity.end_time ? ` - ${activity.end_time}` : ''}</div>
                        ` : ''}
                    </div>
                    
                    ${activity.description ? `<div class="activity-details">${activity.description}</div>` : ''}
                    
                    ${settings.include_locations && activity.location ? `
                        <div class="activity-details">📍 ${activity.location}</div>
                    ` : ''}
                    
                    ${settings.include_costs && activity.cost ? `
                        <div class="activity-details activity-cost">💰 ${format_currency(activity.cost)}</div>
                    ` : ''}
                    
                    ${settings.include_notes && activity.notes ? `
                        <div class="activity-details">📝 ${activity.notes}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}

    <div class="summary">
        <div class="summary-title">סיכום החופשה</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-number">${Object.keys(grouped_activities).length}</div>
                <div class="summary-label">ימי חופשה</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${activities.length}</div>
                <div class="summary-label">פעילויות</div>
            </div>
            ${settings.include_costs ? `
                <div class="summary-item">
                    <div class="summary-number">${format_currency(total_cost)}</div>
                    <div class="summary-label">עלות כוללת</div>
                </div>
            ` : ''}
            <div class="summary-item">
                <div class="summary-number">${vacation.participants}</div>
                <div class="summary-label">משתתפים</div>
            </div>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
        הופק על ידי מתכנן החופשות • ${new Date().toLocaleDateString('he-IL')}
    </div>
</body>
</html>`

    return html
  }

  // Print vacation itinerary
  print_vacation = (vacation: Vacation, activities: VacationActivity[], settings: PrintSettings): void => {
    const html = this.generate_printable_html(vacation, activities, settings)
    
    // Open print window
    const print_window = window.open('', '_blank')
    if (print_window) {
      print_window.document.write(html)
      print_window.document.close()
      print_window.onload = () => {
        print_window.print()
      }
    }
  }

  // Clone/copy vacation
  clone_vacation = (vacation: Vacation, activities: VacationActivity[]): { vacation: Vacation; activities: VacationActivity[] } => {
    const cloned_vacation: Vacation = {
      ...vacation,
      id: this.generate_id(),
      title: `${vacation.title} (עותק)`,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const cloned_activities: VacationActivity[] = activities.map(activity => ({
      ...activity,
      id: this.generate_id(),
      vacation_id: cloned_vacation.id
    }))

    return { vacation: cloned_vacation, activities: cloned_activities }
  }

  // Private helper methods
  private generate_ics_content = (vacation: Vacation, activities: VacationActivity[]): string => {
    const start_date = new Date(vacation.start_date)
    const end_date = new Date(vacation.end_date)
    
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VacationPlanner//VacationPlanner 1.0//HE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + vacation.title,
      'X-WR-CALDESC:תכנית חופשה ב' + vacation.destination
    ]

    // Add main vacation event
    ics = ics.concat([
      'BEGIN:VEVENT',
      'UID:vacation-' + vacation.id + '@vacationplanner.com',
      'DTSTAMP:' + this.format_ics_date(new Date()),
      'DTSTART;VALUE=DATE:' + this.format_ics_date(start_date, true),
      'DTEND;VALUE=DATE:' + this.format_ics_date(new Date(end_date.getTime() + 86400000), true), // Add one day
      'SUMMARY:' + vacation.title,
      'DESCRIPTION:חופשה ב' + vacation.destination + '\\n' + (vacation.description || ''),
      'LOCATION:' + vacation.destination,
      'END:VEVENT'
    ])

    // Add activities as events
    activities.forEach(activity => {
      if (activity.start_time) {
        const activity_date = new Date(start_date)
        activity_date.setDate(activity_date.getDate() + activity.day - 1)
        
        const [hours, minutes] = activity.start_time.split(':')
        activity_date.setHours(parseInt(hours), parseInt(minutes))
        
        const end_time = new Date(activity_date)
        if (activity.end_time) {
          const [end_hours, end_minutes] = activity.end_time.split(':')
          end_time.setHours(parseInt(end_hours), parseInt(end_minutes))
        } else {
          end_time.setHours(end_time.getHours() + 1) // Default 1 hour duration
        }

        ics = ics.concat([
          'BEGIN:VEVENT',
          'UID:activity-' + activity.id + '@vacationplanner.com',
          'DTSTAMP:' + this.format_ics_date(new Date()),
          'DTSTART:' + this.format_ics_date(activity_date),
          'DTEND:' + this.format_ics_date(end_time),
          'SUMMARY:' + activity.title,
          'DESCRIPTION:' + (activity.description || '') + (activity.notes ? '\\n\\nהערות: ' + activity.notes : ''),
          'LOCATION:' + (activity.location || vacation.destination),
          'END:VEVENT'
        ])
      }
    })

    ics.push('END:VCALENDAR')
    return ics.join('\r\n')
  }

  private format_ics_date = (date: Date, date_only = false): string => {
    if (date_only) {
      return date.toISOString().slice(0, 10).replace(/-/g, '')
    }
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  private group_activities_by_day = (activities: VacationActivity[]): Record<number, VacationActivity[]> => {
    return activities.reduce((acc, activity) => {
      if (!acc[activity.day]) {
        acc[activity.day] = []
      }
      acc[activity.day].push(activity)
      return acc
    }, {} as Record<number, VacationActivity[]>)
  }

  private get_category_label = (category: string): string => {
    const labels: Record<string, string> = {
      attraction: 'אטרקציה',
      restaurant: 'מסעדה',
      accommodation: 'לינה',
      transport: 'תחבורה',
      activity: 'פעילות',
      other: 'אחר'
    }
    return labels[category] || category
  }

  private calculate_duration_days = (start_date: string, end_date: string): number => {
    const start = new Date(start_date)
    const end = new Date(end_date)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  private download_file = (content: string, filename: string, mime_type: string): void => {
    const blob = new Blob([content], { type: mime_type })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  private read_file_as_text = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  private generate_id = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Singleton instance
export const export_service = new ExportService()