interface Props {
  label: string
  value: number
  emoji: string
  color: string
}

export default function StatsWidget({ label, value, emoji, color }: Props) {
  return (
    <div className={`bg-white rounded-card shadow-card p-4 border-l-4 ${color}`}>
      <div className="text-2xl font-bold text-text-main">{value}</div>
      <div className="text-sm text-text-muted mt-1">{emoji} {label}</div>
    </div>
  )
}
