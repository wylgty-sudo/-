import { createClient } from '@/lib/supabase/server'
import { todayStr } from '@/lib/utils/dates'

export type ItemCategory = 'today_todo' | 'backlog' | 'inspiration' | 'material' | 'habit'
export type ItemStatus = 'active' | 'completed' | 'cancelled'

export type Item = {
  id: string
  user_id: string
  category: ItemCategory
  title: string
  content: string | null
  status: ItemStatus
  quadrant: number | null
  due_date: string | null
  display_date: string | null
  media_url: string | null
  link_url: string | null
  link_title: string | null
  link_image: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type CreateItemInput = {
  category: ItemCategory
  title: string
  content?: string
  quadrant?: number
  due_date?: string
  link_url?: string
  link_title?: string
  link_image?: string
  media_url?: string
}

export async function getItemsByCategory(category: ItemCategory): Promise<Item[]> {
  const supabase = await createClient()
  const today = todayStr()

  let query = supabase
    .from('items')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (category === 'today_todo') {
    query = (query as any)
      .eq('status', 'active')
      .or(`display_date.eq.${today},and(display_date.is.null,created_at.gte.${today}T00:00:00Z)`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Item[]
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload = {
    ...input,
    user_id: user.id,
    display_date: input.category === 'today_todo' ? todayStr() : null,
  }

  const { data, error } = await supabase.from('items').insert(payload).select().single()
  if (error) throw error
  return data as Item
}

export async function completeItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('items')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function cancelItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('items')
    .update({ status: 'cancelled', completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getItemsForDay(dateStr: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(
      `display_date.eq.${dateStr},` +
      `and(display_date.is.null,created_at.gte.${dateStr}T00:00:00Z,created_at.lt.${dateStr}T23:59:59Z)`
    )
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Item[]
}

export async function searchItems(query: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return (data ?? []) as Item[]
}
