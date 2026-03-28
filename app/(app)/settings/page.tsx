import { redirect } from 'next/navigation'
import { getAllowedUsers, isCurrentUserAdmin, addAllowedUser, removeAllowedUser } from '@/lib/db/users'
import { createClient } from '@/lib/supabase/server'

async function addUser(formData: FormData) {
  'use server'
  const email = formData.get('email')?.toString().trim()
  if (!email) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await addAllowedUser(email, user.id)
  redirect('/settings')
}

async function removeUser(formData: FormData) {
  'use server'
  const id = formData.get('id')?.toString()
  if (!id) return
  await removeAllowedUser(id)
  redirect('/settings')
}

export default async function SettingsPage() {
  const isAdmin = await isCurrentUserAdmin()
  if (!isAdmin) redirect('/today')

  const users = await getAllowedUsers()

  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main mb-4">设置</h1>

      <div className="bg-white rounded-card shadow-card p-5 mb-4">
        <h2 className="text-sm font-semibold text-text-main mb-3">邀请成员</h2>
        <form action={addUser} className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="输入 Gmail 邮箱地址"
            required
            className="flex-1 bg-warm rounded-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            className="bg-accent text-white text-sm px-4 py-2 rounded-card hover:bg-orange-600 transition-colors"
          >
            添加
          </button>
        </form>
      </div>

      <div className="bg-white rounded-card shadow-card p-5">
        <h2 className="text-sm font-semibold text-text-main mb-3">
          已授权成员 ({users.length})
        </h2>
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between text-sm py-2 border-b border-stone-50 last:border-0">
              <div>
                <span className="text-text-main">{user.email}</span>
                {user.is_admin && (
                  <span className="ml-2 text-xs bg-orange-100 text-accent px-2 py-0.5 rounded-full">管理员</span>
                )}
              </div>
              {!user.is_admin && (
                <form action={removeUser}>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted hover:text-red-400 transition-colors"
                  >
                    移除
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
