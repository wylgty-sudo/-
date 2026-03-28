'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VoiceInput from './VoiceInput'
import { createItem, type ItemCategory } from '@/lib/db/items'

const CATEGORIES: { value: ItemCategory; label: string; emoji: string }[] = [
  { value: 'today_todo', label: '今日待办', emoji: '📋' },
  { value: 'backlog', label: '待处理', emoji: '📥' },
  { value: 'inspiration', label: '选题灵感', emoji: '💡' },
  { value: 'material', label: '素材收集', emoji: '📌' },
  { value: 'habit', label: '日常习惯', emoji: '✅' },
]

const QUADRANTS = [
  { value: 1, label: '重要且紧急' },
  { value: 2, label: '重要不紧急' },
  { value: 3, label: '不重要紧急' },
  { value: 4, label: '不重要不紧急' },
]

interface Props {
  onClose: () => void
  defaultCategory?: ItemCategory
}

export default function QuickAddModal({ onClose, defaultCategory = 'today_todo' }: Props) {
  const [category, setCategory] = useState<ItemCategory>(defaultCategory)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [quadrant, setQuadrant] = useState(1)
  const [dueDate, setDueDate] = useState('')
  const [linkPreview, setLinkPreview] = useState<{ title: string; image: string | null } | null>(null)
  const [fetchingPreview, setFetchingPreview] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isLink = /^https?:\/\//.test(title.trim())

  useEffect(() => {
    if (!isLink) { setLinkPreview(null); return }
    const timer = setTimeout(async () => {
      setFetchingPreview(true)
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(title.trim())}`)
        const data = await res.json()
        setLinkPreview(data)
        if (data.title && data.title !== title.trim()) setTitle(data.title)
      } catch {
        // ignore preview errors
      } finally {
        setFetchingPreview(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [title, isLink])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      await createItem({
        category: isLink ? 'material' : category,
        title: title.trim(),
        content: content.trim() || undefined,
        quadrant: category === 'today_todo' ? quadrant : undefined,
        due_date: dueDate || undefined,
        link_url: isLink ? title.trim() : undefined,
        link_title: linkPreview?.title,
        link_image: linkPreview?.image ?? undefined,
      })
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl md:rounded-card shadow-xl w-full md:max-w-lg p-5 pb-8 md:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-main">添加记录</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="标题或链接..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-warm rounded-card px-4 py-2.5 text-sm text-text-main outline-none focus:ring-2 focus:ring-accent/30"
            />
            <VoiceInput onTranscript={(t) => setTitle((prev) => prev ? prev + ' ' + t : t)} />
          </div>

          {fetchingPreview && (
            <p className="text-xs text-text-muted">正在抓取链接预览...</p>
          )}
          {linkPreview?.image && (
            <img src={linkPreview.image} alt="" className="w-full h-24 object-cover rounded-card" />
          )}

          <textarea
            placeholder="备注（可选）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="bg-warm rounded-card px-4 py-2.5 text-sm text-text-main outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  category === cat.value
                    ? 'bg-accent text-white'
                    : 'bg-stone-100 text-text-muted hover:bg-stone-200'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {category === 'today_todo' && (
            <select
              value={quadrant}
              onChange={(e) => setQuadrant(Number(e.target.value))}
              className="bg-warm rounded-card px-4 py-2 text-sm text-text-main outline-none"
            >
              {QUADRANTS.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          )}

          {category === 'today_todo' && (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-warm rounded-card px-4 py-2 text-sm text-text-main outline-none"
            />
          )}

          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className="bg-accent text-white rounded-card py-2.5 font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isPending ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  )
}
