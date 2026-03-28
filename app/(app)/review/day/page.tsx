import { getItemsForDay } from '@/lib/db/items'
import DayTimeline from '@/components/review/DayTimeline'
import { todayStr, formatDate } from '@/lib/utils/dates'

export default async function DayReviewPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const date = searchParams.date ?? todayStr()
  const items = await getItemsForDay(date)
  const completed = items.filter((i) => i.status === 'completed').length
  const total = items.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">日视图</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {formatDate(date)} · 完成 {completed} / 共 {total} 项
          </p>
        </div>
        <form className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="bg-warm rounded-card px-3 py-1.5 text-sm outline-none text-text-main"
          />
          <button
            type="submit"
            className="bg-accent text-white text-sm px-3 py-1.5 rounded-card hover:bg-orange-600 transition-colors"
          >
            查看
          </button>
        </form>
      </div>
      <DayTimeline items={items} />
    </div>
  )
}
