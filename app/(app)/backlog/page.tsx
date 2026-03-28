import { getItemsByCategory } from '@/lib/db/items'
import ItemCard from '@/components/items/ItemCard'

export default async function BacklogPage() {
  const items = await getItemsByCategory('backlog')
  const active = items.filter((i) => i.status === 'active')

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">待处理清单</h1>
        <p className="text-sm text-text-muted mt-0.5">{active.length} 项待处理</p>
      </div>
      <div className="flex flex-col gap-3">
        {active.map((item) => <ItemCard key={item.id} item={item} />)}
        {active.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">暂无待处理事项 ✨</p>
        )}
      </div>
    </div>
  )
}
