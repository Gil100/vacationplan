import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { VacationActivity } from '../../stores/vacation_store'
import { ActivityCard } from './ActivityCard'

interface SortableActivityCardProps {
  activity: VacationActivity
  on_update: (updates: Partial<VacationActivity>) => void
  on_delete: () => void
}

export const SortableActivityCard: React.FC<SortableActivityCardProps> = ({
  activity,
  on_update,
  on_delete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <ActivityCard
        activity={activity}
        on_drag_start={() => {}} // Not needed with dnd-kit
        on_update={on_update}
        on_delete={on_delete}
      />
    </div>
  )
}