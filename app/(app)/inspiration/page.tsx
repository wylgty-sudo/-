import { getItemsByCategory } from '@/lib/db/items'

export default async function InspirationPage() {
  const items = await getItemsByCategory('inspiration')
  const active = items.filter((i) => i.status === 'active')

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-text-main">选题灵感</h1>
        <p className="text-sm text-text-muted mt-0.5">{active.length} 条灵感</p>
      </div>
      <div className="columns-1 md:columns-2 gap-3 space-y-3">
        {active.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <div className="bg-white rounded-card shadow-card p-4">
              <p className="text-sm font-medium text-text-main leading-snug">{item.title}</p>
              {item.content && (
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{item.content}</p>
              )}
              <span className="text-xs text-text-muted mt-2 block">
                {new Date(item.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        ))}
        {active.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">还没有灵感，快记下来吧 💡</p>
        )}
      </div>
    </div>
  )
}
