import type { Item } from '@/lib/db/items'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function DayTimeline({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="text-text-muted text-sm text-center py-12">当天没有记录</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 bg-white rounded-card shadow-card flex items-start gap-3 ${
            item.status !== 'active' ? 'opacity-60' : ''
          }`}
        >
          <span className="text-lg mt-0.5">
            {item.status === 'completed' ? '✅' : item.status === 'cancelled' ? '❌' : '⬜'}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-text-main ${
              item.status !== 'active' ? 'line-through' : ''
            }`}>
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge category={item.category} />
              {item.status === 'cancelled' && (
                <span className="text-xs bg-stone-100 text-text-muted px-2 py-0.5 rounded-full">已取消</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
