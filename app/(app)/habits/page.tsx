import { getHabitsWithLogs } from '@/lib/db/habits'
import HabitRow from '@/components/habits/HabitRow'

export default async function HabitsPage() {
  const habits = await getHabitsWithLogs()
  const uncheckedToday = habits.filter((h) => !h.checkedToday)

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">日常习惯</h1>
        <p className="text-sm text-text-muted mt-0.5">
          今日已打卡 {habits.length - uncheckedToday.length} / {habits.length} 项
        </p>
      </div>

      {uncheckedToday.length > 0 && (
        <div className="mb-3 p-3 bg-orange-50 rounded-card border border-orange-100 text-xs text-accent">
          ⏰ 今日还有 {uncheckedToday.length} 项习惯未打卡
        </div>
      )}

      <div className="flex flex-col gap-3">
        {habits.map((habit) => <HabitRow key={habit.id} habit={habit} />)}
        {habits.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">
            添加你的第一个习惯，坚持打卡 ✅
          </p>
        )}
      </div>
    </div>
  )
}
