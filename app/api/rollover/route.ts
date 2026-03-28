import { createServiceClient } from '@/lib/supabase/service'
import { getItemsToRollover } from '@/lib/utils/rollover'
import { todayStr } from '@/lib/utils/dates'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = todayStr()

  const { data: items, error } = await supabase
    .from('items')
    .select('id, display_date, created_at')
    .eq('category', 'today_todo')
    .eq('status', 'active')
    .neq('display_date', today)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const toRollover = getItemsToRollover(items ?? [])

  if (toRollover.length > 0) {
    const { error: updateError } = await supabase
      .from('items')
      .update({ display_date: today })
      .in('id', toRollover)
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ rolled: toRollover.length, date: today })
}
