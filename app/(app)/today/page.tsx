import { getItemsByCategory } from '@/lib/db/items'
import QuadrantGrid from '@/components/today/QuadrantGrid'

export default async function TodayPage() {
  const items = await getItemsByCategory('today_todo')
  const doneCount = items.filter((i) => i.status === 'completed').length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">今日待办</h1>
          <p className="text-sm text-text-muted mt-0.5">
            已完成 {doneCount} / 共 {items.length} 项
          </p>
        </div>
      </div>
      <QuadrantGrid items={items} />
    </div>
  )
}
