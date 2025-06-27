import React from 'react'
import { Card } from '../ui'
import { Vacation } from '../../stores/vacation_store'

interface DashboardStatsProps {
  vacations: Vacation[]
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ vacations }) => {
  const stats = React.useMemo(() => {
    const total = vacations.length
    const draft = vacations.filter(v => v.status === 'draft').length
    const planning = vacations.filter(v => v.status === 'planning').length
    const confirmed = vacations.filter(v => v.status === 'confirmed').length
    const completed = vacations.filter(v => v.status === 'completed').length

    return { total, draft, planning, confirmed, completed }
  }, [vacations])

  const stat_cards = [
    {
      title: 'סה״כ חופשות',
      value: stats.total,
      icon: '🏖️',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'בתכנון',
      value: stats.planning,
      icon: '📝',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'מאושרות',
      value: stats.confirmed,
      icon: '✅',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'הושלמו',
      value: stats.completed,
      icon: '🎉',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stat_cards.map((stat, index) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} mb-3`}>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStats