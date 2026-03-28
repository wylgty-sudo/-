import QuadrantCard from './QuadrantCard'
import type { Item } from '@/lib/db/items'

const QUADRANTS = [
  { id: 1, title: '重要且紧急', subtitle: '立即做', color: 'border-red-200 bg-red-50/50' },
  { id: 2, title: '重要不紧急', subtitle: '计划做', color: 'border-blue-200 bg-blue-50/50' },
  { id: 3, title: '不重要紧急', subtitle: '快速处理', color: 'border-amber-200 bg-amber-50/50' },
  { id: 4, title: '不重要不紧急', subtitle: '考虑删除', color: 'border-stone-200 bg-stone-50/50' },
]

export default function QuadrantGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUADRANTS.map((q) => {
        const quadrantItems = items.filter((i) => i.quadrant === q.id)
        return (
          <div key={q.id} className={`rounded-card border p-3 min-h-32 ${q.color}`}>
            <div className="mb-2">
              <p className="text-xs font-semibold text-text-main">{q.title}</p>
              <p className="text-xs text-text-muted">{q.subtitle}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {quadrantItems.map((item) => (
                <QuadrantCard key={item.id} item={item} />
              ))}
              {quadrantItems.length === 0 && (
                <p className="text-xs text-text-muted italic">暂无任务</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
