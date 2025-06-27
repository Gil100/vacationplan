import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  const current_year = new Date().getFullYear()

  const footer_links = [
    { name: 'אודות', href: '/about' },
    { name: 'צור קשר', href: '/contact' },
    { name: 'תנאי שימוש', href: '/terms' },
    { name: 'מדיניות פרטיות', href: '/privacy' },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 hebrew-text">
              תכנון חופשות
            </h3>
            <p className="text-gray-600 text-sm hebrew-text leading-relaxed">
              המערכת המתקדמת ביותר לתכנון חופשות משפחתיות בישראל
            </p>
          </div>
          
          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 hebrew-text">
              קישורים מהירים
            </h4>
            <ul className="space-y-2">
              {footer_links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 text-sm hebrew-text transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 hebrew-text">
              צור קשר
            </h4>
            <div className="text-gray-600 text-sm hebrew-text space-y-1">
              <p>אימייל: support@vacationplan.co.il</p>
              <p>טלפון: 03-1234567</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600 text-sm hebrew-text">
            <p>&copy; {current_year} תכנון חופשות. כל הזכויות שמורות.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer