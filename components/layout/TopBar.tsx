'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const QuickAddModal = dynamic(() => import('@/components/items/QuickAddModal'), { ssr: false })
const SearchResults = dynamic(() => import('@/components/search/SearchResults'), { ssr: false })

export default function TopBar() {
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-stone-100 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="搜索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-warm rounded-card px-4 py-2 text-sm text-text-main placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/30"
          />
          {query && <SearchResults query={query} onClose={() => setQuery('')} />}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-accent text-white rounded-card flex items-center justify-center text-xl font-light hover:bg-orange-600 transition-colors flex-shrink-0"
          aria-label="添加记录"
        >
          +
        </button>
      </header>
      {showAdd && <QuickAddModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
