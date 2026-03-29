import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (user?.email) {
      const { count, error: countError } = await supabase
        .from('allowed_users')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('db:' + countError.message)}`)
      }

      const isFirstUser = count === 0 || count === null
      const isAdminEmail = user.email === process.env.ADMIN_EMAIL

      if (isFirstUser || isAdminEmail) {
        const service = createServiceClient()
        const { error: upsertError } = await service.from('allowed_users').upsert(
          { email: user.email, is_admin: true, invited_by: user.id },
          { onConflict: 'email' }
        )
        if (upsertError) {
          return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('upsert:' + upsertError.message)}`)
        }
      }

      return NextResponse.redirect(`${origin}/today`)
    }

    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
