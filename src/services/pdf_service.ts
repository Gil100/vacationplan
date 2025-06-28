import { Vacation, VacationActivity } from '../stores/vacation_store'
import { format_currency } from '../utils/currency_utils'
import { PrintSettings } from './export_service'

// Note: In a real implementation, you would use a library like jsPDF or puppeteer
// This is a mock implementation that generates HTML for PDF conversion

export interface PDFOptions {
  format: 'A4' | 'Letter'
  orientation: 'portrait' | 'landscape'
  include_images: boolean
  quality: 'high' | 'medium' | 'low'
}

export class PDFService {
  // Generate PDF using browser's print-to-PDF functionality
  generate_pdf = async (
    vacation: Vacation, 
    activities: VacationActivity[], 
    settings: PrintSettings,
    options: PDFOptions = { format: 'A4', orientation: 'portrait', include_images: true, quality: 'high' }
  ): Promise<void> => {
    const html = this.generate_pdf_html(vacation, activities, settings, options)
    
    // Create a new window for PDF generation
    const pdf_window = window.open('', '_blank')
    if (!pdf_window) {
      throw new Error('לא ניתן לפתוח חלון חדש. אנא אפשר חלונות קופצים.')
    }

    pdf_window.document.write(html)
    pdf_window.document.close()

    // Wait for content to load
    await new Promise(resolve => {
      pdf_window.onload = resolve
      setTimeout(resolve, 1000) // Fallback timeout
    })

    // Open print dialog with PDF option
    pdf_window.print()
  }

  // Generate optimized HTML for PDF
  private generate_pdf_html = (
    vacation: Vacation, 
    activities: VacationActivity[], 
    settings: PrintSettings,
    options: PDFOptions
  ): string => {
    const grouped_activities = this.group_activities_by_day(activities)
    const total_cost = activities.reduce((sum, act) => sum + (act.cost || 0), 0)
    const duration_days = this.calculate_duration_days(vacation.start_date, vacation.end_date)
    
    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>תכנית חופשה - ${vacation.title}</title>
    <style>
        ${this.get_pdf_styles(settings, options)}
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="cover-header">
            <div class="logo">🌴</div>
            <h1 class="cover-title">תכנית חופשה</h1>
            <div class="cover-subtitle">${vacation.title}</div>
        </div>
        
        <div class="cover-details">
            <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span class="detail-label">יעד:</span>
                <span class="detail-value">${vacation.destination}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">📅</span>
                <span class="detail-label">תאריכים:</span>
                <span class="detail-value">${vacation.start_date} - ${vacation.end_date}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">👥</span>
                <span class="detail-label">משתתפים:</span>
                <span class="detail-value">${vacation.participants}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">⏱️</span>
                <span class="detail-label">משך:</span>
                <span class="detail-value">${duration_days} ימים</span>
            </div>
            ${settings.include_costs ? `
                <div class="detail-item">
                    <span class="detail-icon">💰</span>
                    <span class="detail-label">תקציב:</span>
                    <span class="detail-value">${format_currency(vacation.budget || 0)}</span>
                </div>
            ` : ''}
        </div>

        ${vacation.description ? `
            <div class="cover-description">
                <h3>תיאור החופשה</h3>
                <p>${vacation.description}</p>
            </div>
        ` : ''}

        <div class="cover-summary">
            <div class="summary-stat">
                <div class="stat-number">${activities.length}</div>
                <div class="stat-label">פעילויות מתוכננות</div>
            </div>
            <div class="summary-stat">
                <div class="stat-number">${Object.keys(grouped_activities).length}</div>
                <div class="stat-label">ימי פעילות</div>
            </div>
            ${settings.include_costs ? `
                <div class="summary-stat">
                    <div class="stat-number">${format_currency(total_cost)}</div>
                    <div class="stat-label">עלות משוערת</div>
                </div>
            ` : ''}
        </div>

        <div class="cover-footer">
            <p>הופק על ידי מתכנן החופשות</p>
            <p>${new Date().toLocaleDateString('he-IL', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>
    </div>

    <!-- Itinerary Pages -->
    ${Object.entries(grouped_activities).map(([day, day_activities]) => `
        <div class="page-break">
            <div class="day-page">
                <div class="day-header">
                    <h2 class="day-title">יום ${day}</h2>
                    <div class="day-date">${this.get_day_date(vacation.start_date, parseInt(day))}</div>
                    ${settings.include_costs ? `
                        <div class="day-cost">
                            עלות: ${format_currency(day_activities.reduce((sum, act) => sum + (act.cost || 0), 0))}
                        </div>
                    ` : ''}
                </div>

                <div class="activities-list">
                    ${day_activities.map((activity, index) => `
                        <div class="activity-item ${index === day_activities.length - 1 ? 'last' : ''}">
                            <div class="activity-main">
                                <div class="activity-header">
                                    <h3 class="activity-title">${activity.title}</h3>
                                    <div class="activity-meta">
                                        <span class="category-badge category-${activity.category}">
                                            ${this.get_category_icon(activity.category)} ${this.get_category_label(activity.category)}
                                        </span>
                                        ${settings.show_timeline && activity.start_time ? `
                                            <span class="time-badge">
                                                ${activity.start_time}${activity.end_time ? ` - ${activity.end_time}` : ''}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>

                                ${activity.description ? `
                                    <div class="activity-description">${activity.description}</div>
                                ` : ''}

                                <div class="activity-details">
                                    ${settings.include_locations && activity.location ? `
                                        <div class="detail-row">
                                            <span class="detail-icon">📍</span>
                                            <span class="detail-text">${activity.location}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${settings.include_costs && activity.cost ? `
                                        <div class="detail-row">
                                            <span class="detail-icon">💰</span>
                                            <span class="detail-text cost-text">${format_currency(activity.cost)}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${this.calculate_duration(activity.start_time, activity.end_time) ? `
                                        <div class="detail-row">
                                            <span class="detail-icon">⏱️</span>
                                            <span class="detail-text">${this.calculate_duration(activity.start_time, activity.end_time)} דקות</span>
                                        </div>
                                    ` : ''}
                                </div>

                                ${settings.include_notes && activity.notes ? `
                                    <div class="activity-notes">
                                        <strong>הערות:</strong> ${activity.notes}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('')}

    <!-- Summary Page -->
    <div class="page-break">
        <div class="summary-page">
            <h2 class="summary-title">סיכום החופשה</h2>
            
            <div class="summary-grid">
                <div class="summary-section">
                    <h3>פירוט כללי</h3>
                    <div class="summary-items">
                        <div class="summary-item">
                            <span class="item-label">יעד:</span>
                            <span class="item-value">${vacation.destination}</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">משך החופשה:</span>
                            <span class="item-value">${duration_days} ימים</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">מספר משתתפים:</span>
                            <span class="item-value">${vacation.participants}</span>
                        </div>
                        <div class="summary-item">
                            <span class="item-label">סה״כ פעילויות:</span>
                            <span class="item-value">${activities.length}</span>
                        </div>
                    </div>
                </div>

                ${settings.include_costs ? `
                    <div class="summary-section">
                        <h3>סיכום עלויות</h3>
                        <div class="summary-items">
                            <div class="summary-item">
                                <span class="item-label">עלות כוללת:</span>
                                <span class="item-value cost-highlight">${format_currency(total_cost)}</span>
                            </div>
                            <div class="summary-item">
                                <span class="item-label">עלות לאדם:</span>
                                <span class="item-value">${format_currency(total_cost / vacation.participants)}</span>
                            </div>
                            <div class="summary-item">
                                <span class="item-label">עלות ממוצעת ליום:</span>
                                <span class="item-value">${format_currency(total_cost / duration_days)}</span>
                            </div>
                            ${vacation.budget ? `
                                <div class="summary-item">
                                    <span class="item-label">יתרת תקציב:</span>
                                    <span class="item-value ${vacation.budget >= total_cost ? 'positive' : 'negative'}">
                                        ${format_currency(vacation.budget - total_cost)}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="summary-section">
                    <h3>פירוט לפי קטגוריות</h3>
                    <div class="category-breakdown">
                        ${this.get_category_breakdown(activities, settings.include_costs)}
                    </div>
                </div>
            </div>

            <div class="footer-note">
                <p>תכנית זו הופקה באמצעות מתכנן החופשות</p>
                <p>נוצר ב-${new Date().toLocaleDateString('he-IL')} • גרסה ${this.getAppVersion()}</p>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  private get_pdf_styles = (settings: PrintSettings, options: PDFOptions): string => {
    return `
        @page {
            size: ${options.format} ${options.orientation};
            margin: 1.5cm;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            direction: rtl;
            text-align: right;
            font-size: 12px;
        }

        .page-break {
            page-break-before: always;
        }

        .page-break:first-child {
            page-break-before: auto;
        }

        /* Cover Page Styles */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            padding: 2cm;
        }

        .cover-header {
            margin-bottom: 3cm;
        }

        .logo {
            font-size: 4rem;
            margin-bottom: 1rem;
        }

        .cover-title {
            font-size: 2.5rem;
            color: #1e40af;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .cover-subtitle {
            font-size: 1.8rem;
            color: #4b5563;
            font-weight: 300;
        }

        .cover-details {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .detail-item {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .detail-icon {
            font-size: 1.3rem;
            margin-left: 0.5rem;
        }

        .detail-label {
            font-weight: bold;
            margin-left: 0.5rem;
            color: #374151;
        }

        .detail-value {
            color: #1e40af;
        }

        .cover-description {
            background: #f8fafc;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 2rem;
            text-align: right;
        }

        .cover-description h3 {
            color: #1e40af;
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }

        .cover-summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 2rem;
        }

        .summary-stat {
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #1e40af;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 0.5rem;
        }

        .cover-footer {
            color: #6b7280;
            font-size: 0.9rem;
        }

        /* Day Page Styles */
        .day-page {
            min-height: 100vh;
            padding: 1rem 0;
        }

        .day-header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .day-title {
            font-size: 1.8rem;
            font-weight: bold;
        }

        .day-date {
            font-size: 1rem;
            opacity: 0.9;
        }

        .day-cost {
            font-size: 1.1rem;
            font-weight: bold;
        }

        .activity-item {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .activity-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #1e40af;
            flex: 1;
        }

        .activity-meta {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .category-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .category-attraction { background: #dbeafe; color: #1e40af; }
        .category-restaurant { background: #dcfce7; color: #166534; }
        .category-accommodation { background: #f3e8ff; color: #7c3aed; }
        .category-transport { background: #fed7aa; color: #c2410c; }
        .category-activity { background: #fce7f3; color: #be185d; }
        .category-other { background: #f1f5f9; color: #475569; }

        .time-badge {
            background: #e0e7ff;
            color: #3730a3;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .activity-description {
            color: #4b5563;
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .activity-details {
            margin-bottom: 1rem;
        }

        .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .detail-icon {
            width: 1.5rem;
            text-align: center;
            margin-left: 0.5rem;
        }

        .detail-text {
            color: #4b5563;
        }

        .cost-text {
            font-weight: bold;
            color: #059669;
        }

        .activity-notes {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 0.25rem;
            padding: 0.75rem;
            font-size: 0.9rem;
            color: #92400e;
        }

        /* Summary Page Styles */
        .summary-page {
            padding: 2rem 0;
        }

        .summary-title {
            font-size: 2rem;
            color: #1e40af;
            text-align: center;
            margin-bottom: 2rem;
            font-weight: bold;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        .summary-section {
            background: #f8fafc;
            border-radius: 0.5rem;
            padding: 1.5rem;
        }

        .summary-section h3 {
            color: #1e40af;
            font-size: 1.3rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #e0e7ff;
            padding-bottom: 0.5rem;
        }

        .summary-items {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
        }

        .item-label {
            font-weight: bold;
            color: #374151;
        }

        .item-value {
            color: #1e40af;
            font-weight: bold;
        }

        .cost-highlight {
            font-size: 1.2rem;
            color: #059669;
        }

        .positive { color: #059669; }
        .negative { color: #dc2626; }

        .category-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .category-item {
            background: white;
            border-radius: 0.5rem;
            padding: 1rem;
            text-align: center;
            border: 1px solid #e5e7eb;
        }

        .category-count {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1e40af;
        }

        .category-name {
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 0.5rem;
        }

        .footer-note {
            margin-top: 3rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.8rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
        }

        @media print {
            body { font-size: 11px; }
            .cover-page { height: auto; min-height: 100vh; }
            .day-page { min-height: auto; }
        }
    `
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

  private calculate_duration_days = (start_date: string, end_date: string): number => {
    const start = new Date(start_date)
    const end = new Date(end_date)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  private get_day_date = (start_date: string, day: number): string => {
    const date = new Date(start_date)
    date.setDate(date.getDate() + day - 1)
    return date.toLocaleDateString('he-IL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  private calculate_duration = (start_time?: string, end_time?: string): number | null => {
    if (!start_time || !end_time) return null
    
    const [start_hours, start_minutes] = start_time.split(':').map(Number)
    const [end_hours, end_minutes] = end_time.split(':').map(Number)
    
    const start_total = start_hours * 60 + start_minutes
    const end_total = end_hours * 60 + end_minutes
    
    return end_total - start_total
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

  private get_category_icon = (category: string): string => {
    const icons: Record<string, string> = {
      attraction: '🏛️',
      restaurant: '🍽️',
      accommodation: '🏨',
      transport: '🚗',
      activity: '🎯',
      other: '📌'
    }
    return icons[category] || '📌'
  }

  private get_category_breakdown = (activities: VacationActivity[], include_costs: boolean): string => {
    const breakdown = activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = { count: 0, cost: 0 }
      }
      acc[activity.category].count += 1
      acc[activity.category].cost += activity.cost || 0
      return acc
    }, {} as Record<string, { count: number; cost: number }>)

    return Object.entries(breakdown).map(([category, data]) => `
      <div class="category-item">
        <div class="category-count">${data.count}</div>
        <div class="category-name">${this.get_category_label(category)}</div>
        ${include_costs && data.cost > 0 ? `
          <div class="category-cost">${format_currency(data.cost)}</div>
        ` : ''}
      </div>
    `).join('')
  }

  private getAppVersion = (): string => {
    return '1.0.0'
  }
}

// Singleton instance
export const pdf_service = new PDFService()