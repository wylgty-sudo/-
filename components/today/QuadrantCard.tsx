'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeItem, cancelItem, type Item } from '@/lib/db/items'
import { dueDateStatus } from '@/lib/utils/dates'

export default function QuadrantCard({ item }: { item: Item }) {
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const dateStatus = dueDateStatus(item.due_date)

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
      className={`group flex items-start gap-2 p-2 rounded-card bg-white shadow-card transition-all duration-300 ${
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
        <p className="text-sm text-text-main leading-snug break-words">{item.title}</p>
        {item.due_date && (
          <span className={`text-xs mt-0.5 inline-block ${
            dateStatus === 'overdue' ? 'text-red-500' :
            dateStatus === 'near' ? 'text-accent' : 'text-text-muted'
          }`}>
            📅 {item.due_date}
          </span>
        )}
      </div>
      <button
        onClick={handleCancel}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-xs transition-opacity"
        aria-label="取消"
      >
        ✕
      </button>
    </div>
  )
}
