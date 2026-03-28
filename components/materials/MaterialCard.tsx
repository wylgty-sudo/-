'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelItem, type Item } from '@/lib/db/items'

export default function MaterialCard({ item }: { item: Item }) {
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRemove() {
    setDone(true)
    setTimeout(() => {
      startTransition(async () => {
        await cancelItem(item.id)
        router.refresh()
      })
    }, 300)
  }

  const image = item.link_image || item.media_url

  return (
    <div
      className={`bg-white rounded-card shadow-card overflow-hidden transition-all duration-300 ${
        done ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
    >
      {image && (
        <img src={image} alt="" className="w-full h-32 object-cover" loading="lazy" />
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-text-main leading-snug line-clamp-2">
          {item.link_title || item.title}
        </p>
        {item.content && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.content}</p>
        )}
        {item.link_url && (
          <a
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent mt-1.5 block truncate hover:underline"
          >
            {(() => { try { return new URL(item.link_url).hostname } catch { return item.link_url } })()}
          </a>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">
            {new Date(item.created_at).toLocaleDateString('zh-CN')}
          </span>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-text-muted hover:text-red-400 transition-colors"
          >
            移除
          </button>
        </div>
      </div>
    </div>
  )
}
