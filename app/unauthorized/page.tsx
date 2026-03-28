export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold text-text-main mb-2">暂无访问权限</h1>
        <p className="text-text-muted text-sm">请联系管理员将你的邮箱加入白名单后再登录。</p>
      </div>
    </div>
  )
}
