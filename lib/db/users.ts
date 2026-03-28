import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type AllowedUser = {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

export async function getAllowedUsers(): Promise<AllowedUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('allowed_users')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as AllowedUser[]
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('allowed_users')
    .select('is_admin')
    .eq('email', user.email!)
    .maybeSingle()
  return data?.is_admin === true
}

export async function addAllowedUser(email: string, invitedBy: string): Promise<void> {
  const service = createServiceClient()
  const { error } = await service.from('allowed_users').insert({ email, invited_by: invitedBy })
  if (error) throw error
}

export async function removeAllowedUser(id: string): Promise<void> {
  const service = createServiceClient()
  const { error } = await service.from('allowed_users').delete().eq('id', id)
  if (error) throw error
}
