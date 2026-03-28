'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeItem, cancelItem, type Item } from '@/lib/db/items'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function ItemCard({ item }: { item: Item }) {
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleComplete() {
    setDone(true)
    setTimeout(() => {
      startTransition(async () => {
        await completeItem(item.id)
        router.refresh()
      })
    }, 300)
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelItem(item.id)
      router.refresh()
    })
  }

  return (
    <div
      className={`group flex items-start gap-3 p-4 bg-white rounded-card shadow-card transition-all duration-300 ${
        done ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="mt-0.5 w-5 h-5 rounded-full border-2 border-stone-300 flex-shrink-0 hover:border-accent transition-colors"
        aria-label="完成"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-main leading-snug">{item.title}</p>
        {item.content && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{item.content}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <CategoryBadge category={item.category} />
          <span className="text-xs text-text-muted">
            {new Date(item.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
      <button
        onClick={handleCancel}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-xs transition-opacity mt-1"
        aria-label="取消"
      >
        ✕
      </button>
    </div>
  )
}
