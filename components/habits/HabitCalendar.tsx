'use client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'

interface Props {
  checkedDates: string[]
  month?: Date
}

export default function HabitCalendar({ checkedDates, month = new Date() }: Props) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })
  const checked = new Set(checkedDates)

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd')
        const isChecked = checked.has(key)
        const today = isToday(day)
        return (
          <div
            key={key}
            title={key}
            className={`w-5 h-5 rounded-sm text-[9px] flex items-center justify-center font-medium transition-colors ${
              isChecked
                ? 'bg-accent text-white'
                : today
                ? 'bg-orange-100 text-accent border border-accent/30'
                : 'bg-stone-100 text-text-muted'
            }`}
          >
            {format(day, 'd')}
          </div>
        )
      })}
    </div>
  )
}
