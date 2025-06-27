// Hebrew translations
export const he_translations = {
  // Common
  common: {
    save: 'שמור',
    cancel: 'בטל',
    delete: 'מחק',
    edit: 'ערוך',
    add: 'הוסף',
    search: 'חפש',
    loading: 'טוען...',
    error: 'שגיאה',
    success: 'הצלחה',
    yes: 'כן',
    no: 'לא',
    close: 'סגור',
    back: 'חזור',
    next: 'הבא',
    previous: 'הקודם',
    required: 'שדה חובה',
    optional: 'אופציונלי'
  },

  // Navigation
  nav: {
    home: 'בית',
    dashboard: 'לוח בקרה',
    planner: 'מתכנן חופשות',
    profile: 'פרופיל',
    settings: 'הגדרות',
    help: 'עזרה',
    logout: 'התנתק'
  },

  // Home page
  home: {
    hero_title: 'תכננו את החופשה המושלמת שלכם',
    hero_subtitle: 'מערכת תכנון חופשות מתקדמת המיועדת למשפחות ישראליות. צרו תוכנית יום יומית מפורטת, גלו יעדים מרתקים והפכו כל רגע לזיכרון בלתי נשכח.',
    start_planning: 'התחילו לתכנן עכשיו',
    view_examples: 'צפו בדוגמאות',
    feature_1_title: 'תכנון יום יומי מפורט',
    feature_1_desc: 'צרו לוח זמנים מדויק לכל יום בחופשה עם פעילויות, מסעדות ואטרקציות מותאמות למשפחה',
    feature_2_title: 'יעדים ישראליים מותאמים',
    feature_2_desc: 'מאגר יעדים עשיר עם התחשבות בכשרות, שבת וחגים, ומותאם לצרכים של משפחות ישראליות',
    feature_3_title: 'ממשק בעברית וידידותי לנייד',
    feature_3_desc: 'ממשק מלא בעברית מותאם לטלפונים חכמים, עם תמיכה מלאה ב-RTL ועיצוב אינטואיטיבי',
    cta_title: 'מוכנים להתחיל את החופשה הבאה?',
    cta_subtitle: 'הצטרפו לאלפי משפחות ישראליות שכבר יוצרות זיכרונות בלתי נשכחים',
    cta_button: 'צרו את התוכנית הראשונה שלכם'
  },

  // Vacation planning
  vacation: {
    title: 'החופשות שלי',
    new_vacation: 'חופשה חדשה',
    vacation_name: 'שם החופשה',
    destination: 'יעד',
    start_date: 'תאריך התחלה',
    end_date: 'תאריך סיום',
    participants: 'מספר משתתפים',
    budget: 'תקציב',
    status: 'סטטוס',
    planning: 'בתכנון',
    ready: 'מוכן',
    completed: 'הושלם',
    draft: 'טיוטה'
  },

  // Form validation
  validation: {
    required_field: 'שדה זה הוא חובה',
    invalid_email: 'כתובת אימייל לא תקינה',
    invalid_number: 'יש להזין מספר תקין',
    min_length: 'מינימום {count} תווים',
    max_length: 'מקסימום {count} תווים',
    password_weak: 'סיסמה חלשה',
    passwords_no_match: 'הסיסמאות אינן תואמות'
  },

  // Date and time
  date: {
    today: 'היום',
    tomorrow: 'מחר',
    yesterday: 'אתמול',
    days_ago: 'לפני {count} ימים',
    in_days: 'בעוד {count} ימים',
    monday: 'יום שני',
    tuesday: 'יום שלישי',
    wednesday: 'יום רביעי',
    thursday: 'יום חמישי',
    friday: 'יום שישי',
    saturday: 'שבת',
    sunday: 'יום ראשון'
  },

  // Errors
  errors: {
    general: 'אירעה שגיאה כללית',
    network: 'שגיאת רשת',
    not_found: 'הדף לא נמצא',
    unauthorized: 'אין הרשאה',
    server_error: 'שגיאת שרת',
    validation_failed: 'אימות נכשל',
    try_again: 'נסו שוב'
  }
}

export type TranslationKeys = typeof he_translations
export default he_translations