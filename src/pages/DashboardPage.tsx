import React from 'react'

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 rtl:text-right">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          לוח הבקרה שלי
        </h1>
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">
            כאן תוכל לנהל את כל התכניות לחופשות שלך
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage