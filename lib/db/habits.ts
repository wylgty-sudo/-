import { createClient } from '@/lib/supabase/server'
import { calculateStreak } from '@/lib/utils/streak'
import { todayStr } from '@/lib/utils/dates'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export type HabitWithLogs = {
  id: string
  title: string
  checkedDates: string[]
  streak: number
  checkedToday: boolean
}

export async function getHabitsWithLogs(): Promise<HabitWithLogs[]> {
  const supabase = await createClient()
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const { data: habits, error: hErr } = await supabase
    .from('items')
    .select('id, title')
    .eq('category', 'habit')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
  if (hErr) throw hErr

  const today = todayStr()
  const result: HabitWithLogs[] = []

  for (const habit of habits ?? []) {
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('checked_date')
      .eq('item_id', habit.id)
      .gte('checked_date', monthStart)
      .lte('checked_date', monthEnd)

    const checkedDates = (logs ?? []).map((l: { checked_date: string }) => l.checked_date)
    result.push({
      id: habit.id,
      title: habit.title,
      checkedDates,
      streak: calculateStreak(checkedDates),
      checkedToday: checkedDates.includes(today),
    })
  }
  return result
}

export async function toggleHabitLog(itemId: string, date: string, checked: boolean): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (checked) {
    await supabase.from('habit_logs').upsert(
      { item_id: itemId, user_id: user.id, checked_date: date },
      { onConflict: 'item_id,checked_date' }
    )
  } else {
    await supabase.from('habit_logs').delete()
      .eq('item_id', itemId).eq('checked_date', date)
  }
}
