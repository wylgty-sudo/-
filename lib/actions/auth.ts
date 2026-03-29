'use server'
import { createServiceClient } from '@/lib/supabase/service'

export async function setupUser(email: string, userId: string) {
  const supabase = createServiceClient()
  const { count } = await supabase
    .from('allowed_users')
    .select('*', { count: 'exact', head: true })

  const isFirstUser = count === 0 || count === null
  const isAdminEmail = email === process.env.ADMIN_EMAIL

  if (isFirstUser || isAdminEmail) {
    await supabase.from('allowed_users').upsert(
      { email, is_admin: true, invited_by: userId },
      { onConflict: 'email' }
    )
  }
}
