'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleHabitLog, type HabitWithLogs } from '@/lib/db/habits'
import { todayStr } from '@/lib/utils/dates'
import HabitCalendar from './HabitCalendar'

export default function HabitRow({ habit }: { habit: HabitWithLogs }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const today = todayStr()

  function handleToggle() {
    startTransition(async () => {
      await toggleHabitLog(habit.id, today, !habit.checkedToday)
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
              habit.checkedToday
                ? 'bg-accent border-accent text-white'
                : 'border-stone-300 hover:border-accent'
            }`}
            aria-label={habit.checkedToday ? '取消打卡' : '打卡'}
          >
            {habit.checkedToday && <span className="text-xs">✓</span>}
          </button>
          <div>
            <p className="text-sm font-medium text-text-main">{habit.title}</p>
            {habit.streak > 0 && (
              <p className="text-xs text-accent mt-0.5">🔥 连续 {habit.streak} 天</p>
            )}
          </div>
        </div>
      </div>
      <HabitCalendar checkedDates={habit.checkedDates} />
    </div>
  )
}
