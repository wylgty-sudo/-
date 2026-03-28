'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CategoryBadge from '@/components/ui/CategoryBadge'
import type { Item } from '@/lib/db/items'

interface Props {
  query: string
  onClose: () => void
}

export default function SearchResults({ query, onClose }: Props) {
  const [results, setResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('items')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(15)
      setResults((data ?? []) as Item[])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (query.length < 2) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-card shadow-xl border border-stone-100 z-50 max-h-80 overflow-y-auto">
      {loading && (
        <div className="px-4 py-3 text-sm text-text-muted">搜索中...</div>
      )}
      {!loading && results.length === 0 && (
        <div className="px-4 py-3 text-sm text-text-muted">无结果</div>
      )}
      {results.map((item) => (
        <button
          key={item.id}
          onClick={onClose}
          className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
        >
          <p className={`text-sm text-text-main font-medium ${
            item.status === 'completed' ? 'line-through opacity-60' : ''
          }`}>
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={item.category} />
            <span className="text-xs text-text-muted">
              {new Date(item.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
