const categoryConfig = {
  today_todo: { label: '今日待办', color: 'bg-today-tag text-rose-700' },
  backlog: { label: '待处理', color: 'bg-backlog-tag text-blue-700' },
  inspiration: { label: '选题灵感', color: 'bg-inspiration-tag text-purple-700' },
  material: { label: '素材收集', color: 'bg-material-tag text-emerald-700' },
  habit: { label: '日常习惯', color: 'bg-habit-tag text-amber-700' },
} as const

type Category = keyof typeof categoryConfig

export default function CategoryBadge({ category }: { category: Category }) {
  const { label, color } = categoryConfig[category]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}
