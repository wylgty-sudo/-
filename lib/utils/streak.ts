import { parseISO, differenceInDays, format, subDays } from 'date-fns'

/**
 * Calculates the current consecutive-day streak from an array of checked date strings (yyyy-MM-dd).
 * Streak counts from today or yesterday backward through consecutive days.
 */
export function calculateStreak(checkedDates: string[]): number {
  if (checkedDates.length === 0) return 0

  const unique = Array.from(new Set(checkedDates)).sort().reverse()
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  if (unique[0] !== today && unique[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const diff = differenceInDays(parseISO(unique[i - 1]), parseISO(unique[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}
