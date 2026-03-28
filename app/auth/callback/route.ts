import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user?.email) {
      // Check if allowed_users is empty (first run) → auto-add as admin
      const { count } = await supabase
        .from('allowed_users')
        .select('*', { count: 'exact', head: true })

      const isFirstUser = count === 0
      const isAdminEmail = user.email === process.env.ADMIN_EMAIL

      if (isFirstUser || isAdminEmail) {
        const service = createServiceClient()
        await service.from('allowed_users').upsert(
          { email: user.email, is_admin: true, invited_by: user.id },
          { onConflict: 'email' }
        )
      }

      return NextResponse.redirect(`${origin}/today`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
