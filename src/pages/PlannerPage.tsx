import React from 'react'

const PlannerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 rtl:text-right">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          מתכנן החופשה
        </h1>
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">
            כאן תוכל לתכנן את החופשה שלך בפרטים
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlannerPage