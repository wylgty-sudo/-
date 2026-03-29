'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today', label: '今日', emoji: '📋' },
  { href: '/backlog', label: '待处理', emoji: '📥' },
  { href: '/inspiration', label: '灵感', emoji: '💡' },
  { href: '/materials', label: '素材', emoji: '📌' },
  { href: '/habits', label: '习惯', emoji: '✅' },
  { href: '/review/day', label: '日视图', emoji: '📅' },
  { href: '/review/week', label: '周视图', emoji: '📆' },
  { href: '/stats', label: '统计', emoji: '📊' },
  { href: '/settings', label: '设置', emoji: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 z-40 overflow-x-auto flex">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex-shrink-0 flex flex-col items-center py-2 px-3 text-xs transition-colors min-w-[64px] ${
            pathname === tab.href ? 'text-accent' : 'text-text-muted'
          }`}
        >
          <span className="text-lg">{tab.emoji}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
