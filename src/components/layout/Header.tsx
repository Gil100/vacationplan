import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Plus } from 'lucide-react'

const Header: React.FC = () => {
  const location = useLocation()

  const navigation_items = [
    { name: 'בית', href: '/', icon: Home },
    { name: 'החופשות שלי', href: '/dashboard', icon: Calendar },
    { name: 'צור חופשה חדשה', href: '/planner', icon: Plus },
  ]

  const is_active = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 hebrew-text">
                תכנון חופשות
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-reverse space-x-8">
            {navigation_items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium hebrew-text transition-colors ${
                    is_active(item.href)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 ml-2" />}
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-blue-600 p-2"
              aria-label="פתח תפריט"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header