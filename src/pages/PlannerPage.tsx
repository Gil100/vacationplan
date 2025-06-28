import React from 'react'
import { DailyItineraryPlanner } from '../components/planner/DailyItineraryPlanner'

const PlannerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 rtl:text-right">
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            מתכנן החופשה
          </h1>
        </div>
        <div className="flex-1">
          <DailyItineraryPlanner />
        </div>
      </div>
    </div>
  )
}

export default PlannerPage