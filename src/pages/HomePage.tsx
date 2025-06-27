import React, { useState } from 'react'
import { Container, Grid, GridItem, Button } from '../components/ui'
import { HebrewTestForm } from '../components/forms/HebrewTestForm'

const HomePage: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [animateStats, setAnimateStats] = useState(false)
  
  const handle_start_planning = (): void => {
    setIsLoading(true)
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false)
      setShowOnboarding(true)
    }, 800)
  }
  
  // Trigger stats animation on page load
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 1000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="min-h-screen">
      {/* Hero Section with Emotional Imagery */}
      <div className="relative bg-gradient-to-br from-vacation-ocean via-primary-500 to-vacation-palm min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>
        
        <Container size="lg" className="relative z-10 text-center text-white">
          {/* Attention - Emotional Hook */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-vacation-sunrise rounded-full animate-pulse"></span>
              <span className="hebrew-text">מתכננים חופשה? אתם במקום הנכון!</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-6 hebrew-text leading-tight">
              הפכו כל חופשה
              <br />
              <span className="text-vacation-sunrise">לזיכרון בלתי נשכח</span>
            </h1>
          </div>
          
          {/* Interest - Pain Point & Solution */}
          <div className="mb-12">
            <p className="text-xl md:text-2xl mb-6 hebrew-text leading-hebrew text-white/90 max-w-4xl mx-auto">
              נמאס לכם לבזבז שעות על תכנון חופשה? להרגיש שפספסתם את הדברים הכי טובים?
            </p>
            <p className="text-lg md:text-xl hebrew-text leading-hebrew text-white/80 max-w-3xl mx-auto">
              המערכת החכמה שלנו תעזור לכם ליצור תוכניות חופשה מושלמות ב-10 דקות!
              <br />
              <strong className="text-vacation-sunrise">כולל המלצות אישיות, לוחות זמנים מדויקים ותמחור שקוף</strong>
            </p>
          </div>
          
          {/* Desire - Social Proof */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
              <div className={`text-center transition-all duration-1000 ${animateStats ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-8'}`}>
                <div className="text-3xl font-bold text-vacation-sunrise mb-1">12,847</div>
                <div className="text-sm text-white/80 hebrew-text">משפחות מרוצות</div>
              </div>
              <div className={`text-center transition-all duration-1000 delay-200 ${animateStats ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-8'}`}>
                <div className="text-3xl font-bold text-vacation-sunrise mb-1">4.9</div>
                <div className="text-sm text-white/80 hebrew-text">דירוג ממוצע</div>
              </div>
              <div className={`text-center transition-all duration-1000 delay-400 ${animateStats ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-8'}`}>
                <div className="text-3xl font-bold text-vacation-sunrise mb-1">2,431</div>
                <div className="text-sm text-white/80 hebrew-text">חופשות החודש</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-vacation-sunrise fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 hebrew-text text-sm">
              "הילדים שלנו עדיין מדברים על החופשה הזאת!" - רחל, תל אביב
            </p>
          </div>
          
          {/* Action - Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handle_start_planning}
              disabled={isLoading}
              className="bg-vacation-sunrise hover:bg-vacation-sunset disabled:bg-vacation-sunrise/70 text-white px-10 py-4 text-xl font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 hebrew-text min-w-[280px] relative"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block ml-3"></div>
                  <span>יוצר עבורכם תוכנית...</span>
                </>
              ) : (
                <>🌴 תכננו את החופשה שלכם - חינם!</>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-medium rounded-xl transition-colors hebrew-text"
            >
              צפו בדוגמאות
            </Button>
          </div>
          
          {/* Trust Signals */}
          <div className="mt-12 text-white/70 text-sm hebrew-text">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span>✓ אין צורך באשראי</span>
              <span>✓ התחלה מיידית</span>
              <span>✓ ללא התחייבות</span>
            </div>
            <p>מוגן על ידי הצפנת SSL ברמה בנקאית</p>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container size="lg" className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 hebrew-text">
            למה בוחרים <span className="text-vacation-ocean">בנו</span>?
          </h2>
          <p className="text-xl text-gray-600 hebrew-text leading-hebrew max-w-3xl mx-auto">
            אנחנו לא רק עוד אתר תכנון - אנחנו השותפים שלכם ליצירת חופשות בלתי נשכחות
          </p>
        </div>
        
        <Grid cols={3} gap="lg" className="mb-16">
          <GridItem className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-vacation-ocean to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 hebrew-text">
              תכנון חכם ב-10 דקות
            </h3>
            <p className="text-gray-600 hebrew-text leading-hebrew text-lg">
              האלגוריתם שלנו יוצר עבורכם תוכנית מושלמת על בסיס העדפותיכם, התקציב וגילאי הילדים
            </p>
          </GridItem>

          <GridItem className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-vacation-palm to-vacation-sunrise rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 hebrew-text">
              יעדים מותאמים לישראלים
            </h3>
            <p className="text-gray-600 hebrew-text leading-hebrew text-lg">
              מאגר של +2,500 יעדים עם מידע על כשרות, שבת, מחירים בשקל ודיווחי ביטחון עדכניים
            </p>
          </GridItem>

          <GridItem className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-vacation-sunrise to-vacation-sand rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 hebrew-text">
              תמיכה 24/7 בעברית
            </h3>
            <p className="text-gray-600 hebrew-text leading-hebrew text-lg">
              הצוות שלנו זמין לכם בכל שעה - לפני, במהלך ואחרי הנסיעה. כולל חוט חם לחירום
            </p>
          </GridItem>
        </Grid>
      </Container>

      {/* Social Proof Section */}
      <div className="bg-gray-50 py-20">
        <Container size="lg">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 hebrew-text">
              מה אומרות <span className="text-vacation-ocean">המשפחות</span>?
            </h2>
            <p className="text-xl text-gray-600 hebrew-text leading-hebrew">
              אלפי משפחות כבר נהנו מחופשות מושלמות איתנו
            </p>
          </div>
          
          <Grid cols={3} gap="lg" className="mb-12">
            <GridItem className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-vacation-sunrise fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 hebrew-text leading-hebrew mb-6 text-lg">
                "הילדים שלנו עדיין מדברים על החופשה הזאת! הכל היה מתוכנן בצורה מושלמת - מהמלון ועד לפעילויות. לא היה לנו אף רגע משעמם."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-vacation-ocean rounded-full flex items-center justify-center text-white font-bold">
                  ר
                </div>
                <div>
                  <div className="font-bold text-gray-900 hebrew-text">רחל כהן</div>
                  <div className="text-gray-500 text-sm hebrew-text">משפחה עם 3 ילדים, תל אביב</div>
                </div>
              </div>
            </GridItem>
            
            <GridItem className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-vacation-sunrise fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 hebrew-text leading-hebrew mb-6 text-lg">
                "חסך לנו שעות של תכנון! בעבר היינו מבלים ימים שלמים בחיפוש אחר מסעדות ואטרקציות. עכשיו הכל מוכן ומותאם בדיוק לנו."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-vacation-palm rounded-full flex items-center justify-center text-white font-bold">
                  ד
                </div>
                <div>
                  <div className="font-bold text-gray-900 hebrew-text">דני וגלית לוי</div>
                  <div className="text-gray-500 text-sm hebrew-text">זוג עם תינוק, חיפה</div>
                </div>
              </div>
            </GridItem>
            
            <GridItem className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-vacation-sunrise fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 hebrew-text leading-hebrew mb-6 text-lg">
                "השירות הכי מקצועי שקיבלנו! גם כשהיו לנו בעיות באחד המלונות, הצוות פתר הכל תוך 10 דקות. מרגישים שיש לנו גב."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-vacation-sunrise rounded-full flex items-center justify-center text-white font-bold">
                  מ
                </div>
                <div>
                  <div className="font-bold text-gray-900 hebrew-text">משה ושרה אברהם</div>
                  <div className="text-gray-500 text-sm hebrew-text">משפחה מורחבת, ירושלים</div>
                </div>
              </div>
            </GridItem>
          </Grid>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6 hebrew-text text-center">
              פעילות אחרונה באתר
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-vacation-ocean/10 rounded-xl">
                <div className="text-2xl font-bold text-vacation-ocean mb-1">15</div>
                <div className="text-sm text-gray-600 hebrew-text">משפחות הזמינו היום</div>
              </div>
              <div className="text-center p-4 bg-vacation-palm/10 rounded-xl">
                <div className="text-2xl font-bold text-vacation-palm mb-1">127</div>
                <div className="text-sm text-gray-600 hebrew-text">תוכניות נוצרו השבוע</div>
              </div>
              <div className="text-center p-4 bg-vacation-sunrise/10 rounded-xl">
                <div className="text-2xl font-bold text-vacation-sunrise mb-1">1,230</div>
                <div className="text-sm text-gray-600 hebrew-text">ביקורים החודש</div>
              </div>
              <div className="text-center p-4 bg-vacation-sand/10 rounded-xl">
                <div className="text-2xl font-bold text-vacation-sand mb-1">98%</div>
                <div className="text-sm text-gray-600 hebrew-text">שביעות רצון</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-vacation-ocean via-primary-600 to-vacation-palm py-20">
        <Container size="lg" className="text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 hebrew-text">
            מוכנים ליצור זיכרונות <span className="text-vacation-sunrise">בלתי נשכחים</span>?
          </h2>
          <p className="text-xl mb-8 opacity-90 hebrew-text leading-hebrew max-w-3xl mx-auto">
            אל תיתנו לעוד חופשה לעבור ללא תכנון מושלם. הצטרפו לאלפי המשפחות הישראליות שכבר חוו את ההבדל
          </p>
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="hebrew-text font-medium">מחיר מיוחד - רק ל-48 השעות הקרובות!</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <Button
              onClick={handle_start_planning}
              disabled={isLoading}
              className="bg-vacation-sunrise hover:bg-vacation-sunset disabled:bg-vacation-sunrise/70 text-white px-12 py-5 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hebrew-text min-w-[350px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white inline-block ml-3"></div>
                  <span>בונה עבורכם את התוכנית המושלמת...</span>
                </>
              ) : (
                <>🎯 בואו נתחיל - זה חינם!</>
              )}
            </Button>
            
            <div className="text-white/80 text-sm hebrew-text">
              ✓ ללא התחייבות  ✓ אין צורך בפרטי אשראי  ✓ התחלה מיידית
            </div>
          </div>
          
          <div className="mt-12 text-white/60 text-sm hebrew-text">
            מוגן ברמה בנקאית | תמיכה 24/7 בעברית | מובטח 100% או החזר כספי
          </div>
        </Container>
      </div>
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 hebrew-text">
                בואו נכיר! 👋
              </h3>
              <p className="text-gray-600 hebrew-text leading-hebrew">
                כמה שאלות קצרות כדי ליצור עבורכם את התוכנית המושלמת
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-text text-right">
                  איך קוראים לכם?
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg text-right hebrew-text"
                  placeholder="השם שלכם"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-text text-right">
                  איך נוכל ליצור איתכם קשר?
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg text-right hebrew-text"
                  placeholder="האימייל שלכם"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-text text-right">
                  באיזה יעד אתם חושבים?
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg text-right hebrew-text">
                  <option>עדיין לא החלטנו</option>
                  <option>אירופה</option>
                  <option>אסיה</option>
                  <option>אמריקה</option>
                  <option>אפריקה</option>
                  <option>אוסטרליה</option>
                  <option>ישראל</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button
                className="flex-1 bg-vacation-sunrise hover:bg-vacation-sunset text-white py-3 rounded-lg hebrew-text font-medium"
                onClick={() => setShowOnboarding(false)}
              >
                המשיכו לתכנון
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 rounded-lg hebrew-text"
                onClick={() => setShowOnboarding(false)}
              >
                בפעם אחרת
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage