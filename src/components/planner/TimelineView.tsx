import React, { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { VacationActivity, use_activities } from '../../stores/vacation_store'
import { ActivityCard } from './ActivityCard'
import { SortableActivityCard } from './SortableActivityCard'
import { AddActivityButton } from './AddActivityButton'

interface TimelineViewProps {
  activities: VacationActivity[]
  selected_day: number
  vacation_id: string
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  activities,
  selected_day,
  vacation_id
}) => {
  const { update_activity, delete_activity } = use_activities()
  const [active_activity, set_active_activity] = useState<VacationActivity | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Sort activities by start time, then by creation order
  const sorted_activities = [...activities].sort((a, b) => {
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time)
    }
    if (a.start_time && !b.start_time) return -1
    if (!a.start_time && b.start_time) return 1
    return 0
  })

  const handle_drag_start = (event: DragStartEvent) => {
    const { active } = event
    const activity = sorted_activities.find(a => a.id === active.id)
    set_active_activity(activity || null)
  }

  const handle_drag_end = (event: DragEndEvent) => {
    const { active, over } = event
    set_active_activity(null)
    
    if (!over) return
    
    if (active.id !== over.id) {
      const old_index = sorted_activities.findIndex(a => a.id === active.id)
      const new_index = sorted_activities.findIndex(a => a.id === over.id)
      
      const new_activities = arrayMove(sorted_activities, old_index, new_index)
      
      // Update start times based on new order
      new_activities.forEach((activity, index) => {
        const new_hour = Math.floor(index * 2) + 8 // Start at 8 AM, 2-hour intervals
        const new_time = `${new_hour.toString().padStart(2, '0')}:00`
        if (activity.start_time !== new_time) {
          update_activity(activity.id, { start_time: new_time })
        }
      })
    }
  }

  if (sorted_activities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            אין פעילויות מתוכננות ליום זה
          </h3>
          <p className="text-gray-500 mb-6">
            התחל בהוספת הפעילות הראשונה ליום {selected_day} של החופשה
          </p>
          <AddActivityButton
            vacation_id={vacation_id}
            day={selected_day}
            variant="primary"
          />
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handle_drag_start}
      onDragEnd={handle_drag_end}
    >
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Timeline Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900">
              לוח זמנים יומי - {sorted_activities.length} פעילויות
            </h4>
            <AddActivityButton
              vacation_id={vacation_id}
              day={selected_day}
              variant="secondary"
            />
          </div>

          {/* Activities List */}
          <SortableContext
            items={sorted_activities.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sorted_activities.map((activity) => (
                <div key={activity.id} className="flex">
                  {/* Time Label */}
                  <div className="w-16 flex-shrink-0 text-sm text-gray-500 font-medium pt-2">
                    {activity.start_time || '--:--'}
                  </div>

                  {/* Activity Card */}
                  <div className="flex-1">
                    <SortableActivityCard
                      activity={activity}
                      on_update={(updates) => update_activity(activity.id, updates)}
                      on_delete={() => delete_activity(activity.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {active_activity ? (
          <div className="flex">
            <div className="w-16 flex-shrink-0 text-sm text-gray-500 font-medium pt-2">
              {active_activity.start_time || '--:--'}
            </div>
            <div className="flex-1">
              <ActivityCard
                activity={active_activity}
                on_drag_start={() => {}}
                on_update={() => {}}
                on_delete={() => {}}
              />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}