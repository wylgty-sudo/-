import { format, startOfDay, isToday, isTomorrow, isPast } from 'date-fns'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MM月dd日')
}

export function dueDateStatus(dateStr: string | null): 'normal' | 'near' | 'overdue' {
  if (!dateStr) return 'normal'
  const d = new Date(dateStr)
  if (isPast(startOfDay(d)) && !isToday(d)) return 'overdue'
  if (isToday(d) || isTomorrow(d)) return 'near'
  return 'normal'
}
