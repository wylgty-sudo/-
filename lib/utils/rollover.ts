import { parseISO, startOfDay, isBefore } from 'date-fns'

export type RolloverItem = {
  id: string
  display_date: string | null
  created_at: string
}

/**
 * Returns IDs of active today_todo items whose display_date is before today.
 * These need their display_date updated to today (rolled over).
 */
export function getItemsToRollover(items: RolloverItem[], today: Date = new Date()): string[] {
  const todayStart = startOfDay(today)
  return items
    .filter((item) => {
      const dateStr = item.display_date ?? item.created_at.slice(0, 10)
      return isBefore(startOfDay(parseISO(dateStr)), todayStart)
    })
    .map((item) => item.id)
}
