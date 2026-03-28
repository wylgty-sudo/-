'use client'
interface Props { onClose: () => void }
export default function QuickAddModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl md:rounded-card p-5 w-full md:max-w-lg">
        <p className="text-text-main">快速添加（即将实现）</p>
        <button onClick={onClose} className="mt-2 text-sm text-text-muted">关闭</button>
      </div>
    </div>
  )
}
