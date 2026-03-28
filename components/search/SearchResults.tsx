'use client'
interface Props { query: string; onClose: () => void }
export default function SearchResults({ query, onClose }: Props) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-card shadow-xl border border-stone-100 z-50 p-3">
      <p className="text-sm text-text-muted">搜索 &ldquo;{query}&rdquo;（即将实现）</p>
    </div>
  )
}
