import { createClient } from '@/lib/supabase/server'
import StatsWidget from '@/components/ui/StatsWidget'
import { todayStr } from '@/lib/utils/dates'
import { format, startOfWeek } from 'date-fns'
import { getHabitsWithLogs } from '@/lib/db/habits'

const CATEGORY_LABELS: Record<string, string> = {
  today_todo: '今日待办',
  backlog: '待处理',
  inspiration: '选题灵感',
  material: '素材收集',
  habit: '日常习惯',
}

const CATEGORY_COLORS: Record<string, string> = {
  today_todo: 'bg-today-tag',
  backlog: 'bg-backlog-tag',
  inspiration: 'bg-inspiration-tag',
  material: 'bg-material-tag',
  habit: 'bg-habit-tag',
}

export default async function StatsPage() {
  const supabase = await createClient()
  const today = todayStr()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const { count: todayCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', `${today}T00:00:00Z`)

  const { count: weekCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', `${weekStart}T00:00:00Z`)

  const { data: categoryData } = await supabase
    .from('items')
    .select('category')
    .eq('status', 'active')

  const categoryCounts: Record<string, number> = {}
  for (const row of categoryData ?? []) {
    categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1
  }
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0)

  const habits = await getHabitsWithLogs()
  const topStreaks = [...habits].sort((a, b) => b.streak - a.streak).slice(0, 3)

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main mb-4">统计</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatsWidget label="今日完成" value={todayCount ?? 0} emoji="🎯" color="border-accent" />
        <StatsWidget label="本周完成" value={weekCount ?? 0} emoji="📈" color="border-blue-300" />
      </div>

      <div className="bg-white rounded-card shadow-card p-4 mb-6">
        <h2 className="text-sm font-semibold text-text-main mb-3">各模块待处理数量</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-16">{CATEGORY_LABELS[cat] ?? cat}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-stone-300'}`}
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-text-muted w-6 text-right">{count}</span>
            </div>
          ))}
          {Object.keys(categoryCounts).length === 0 && (
            <p className="text-xs text-text-muted">暂无数据</p>
          )}
        </div>
      </div>

      {topStreaks.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="text-sm font-semibold text-text-main mb-3">习惯连击排行</h2>
          <div className="flex flex-col gap-2">
            {topStreaks.map((h, i) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="text-text-main">{['🥇', '🥈', '🥉'][i]} {h.title}</span>
                <span className="text-accent font-medium">🔥 {h.streak} 天</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
