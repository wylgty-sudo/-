'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/today', label: '今日待办', emoji: '📋' },
  { href: '/backlog', label: '待处理', emoji: '📥' },
  { href: '/inspiration', label: '选题灵感', emoji: '💡' },
  { href: '/materials', label: '素材收集', emoji: '📌' },
  { href: '/habits', label: '日常习惯', emoji: '✅' },
]

const reviewItems = [
  { href: '/review/day', label: '日视图', emoji: '📅' },
  { href: '/review/week', label: '周视图', emoji: '📆' },
  { href: '/stats', label: '统计', emoji: '📊' },
  { href: '/settings', label: '设置', emoji: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-stone-100 h-screen sticky top-0 p-4 gap-1">
      <div className="text-lg font-semibold text-text-main px-2 py-3 mb-2">个人助理</div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
            pathname === item.href
              ? 'bg-orange-50 text-accent font-medium'
              : 'text-text-muted hover:bg-stone-50 hover:text-text-main'
          }`}
        >
          <span>{item.emoji}</span>
          {item.label}
        </Link>
      ))}
      <div className="mt-4 border-t border-stone-100 pt-4 flex flex-col gap-1">
        {reviewItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
              pathname === item.href
                ? 'bg-orange-50 text-accent font-medium'
                : 'text-text-muted hover:bg-stone-50 hover:text-text-main'
            }`}
          >
            <span>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
