import { createClient } from '@/lib/supabase/server'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'
import { todayStr, formatDate } from '@/lib/utils/dates'
import DayTimeline from '@/components/review/DayTimeline'
import type { Item } from '@/lib/db/items'

export default async function WeekReviewPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const anchor = parseISO(searchParams.date ?? todayStr())
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const supabase = await createClient()
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .gte('created_at', `${format(weekStart, 'yyyy-MM-dd')}T00:00:00Z`)
    .lte('created_at', `${format(weekEnd, 'yyyy-MM-dd')}T23:59:59Z`)
    .order('created_at', { ascending: true })

  const allItems: Item[] = (items ?? []) as Item[]
  const expandedDay = searchParams.date ?? todayStr()

  const byDay: Record<string, Item[]> = {}
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd')
    byDay[key] = allItems.filter((i) => {
      const d = i.display_date ?? i.created_at.slice(0, 10)
      return d === key
    })
  }

  const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">周视图</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {formatDate(format(weekStart, 'yyyy-MM-dd'))} — {formatDate(format(weekEnd, 'yyyy-MM-dd'))}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayItems = byDay[key] ?? []
          const done = dayItems.filter((i) => i.status === 'completed').length
          const isToday = key === todayStr()
          const dow = day.getDay()
          const label = DAY_LABELS[dow === 0 ? 6 : dow - 1]
          return (
            <a key={key} href={`/review/week?date=${key}`} className="text-center">
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-accent' : 'text-text-muted'}`}>
                {label}
              </div>
              <div className={`rounded-card py-2 px-1 text-xs transition-colors ${
                isToday ? 'bg-orange-50 border border-accent/20' : 'bg-white hover:bg-stone-50'
              }`}>
                <div className="font-semibold text-text-main">{format(day, 'd')}</div>
                <div className="text-text-muted">{done}/{dayItems.length}</div>
              </div>
            </a>
          )
        })}
      </div>

      <div>
        <h2 className="text-base font-medium text-text-main mb-3">
          {formatDate(expandedDay)} 详情
        </h2>
        <DayTimeline items={byDay[expandedDay] ?? []} />
      </div>
    </div>
  )
}
