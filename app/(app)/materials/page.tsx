import { getItemsByCategory } from '@/lib/db/items'
import MaterialCard from '@/components/materials/MaterialCard'

export default async function MaterialsPage() {
  const items = await getItemsByCategory('material')
  const active = items.filter((i) => i.status === 'active')

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">素材收集</h1>
        <p className="text-sm text-text-muted mt-0.5">{active.length} 条素材</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {active.map((item) => <MaterialCard key={item.id} item={item} />)}
        {active.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12 col-span-3">
            还没有素材，粘贴链接或上传截图 📌
          </p>
        )}
      </div>
    </div>
  )
}
