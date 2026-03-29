import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user?.email) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error?.message ?? 'no_user')}`)
  }

  // Auto-add first user or admin email
  const { count } = await supabase
    .from('allowed_users')
    .select('*', { count: 'exact', head: true })

  const isFirstUser = count === 0 || count === null
  const isAdminEmail = user.email === process.env.ADMIN_EMAIL

  if (isFirstUser || isAdminEmail) {
    const service = createServiceClient()
    await service.from('allowed_users').upsert(
      { email: user.email, is_admin: true, invited_by: user.id },
      { onConflict: 'email' }
    )
  }

  // Build redirect response and explicitly copy all cookies onto it
  const response = NextResponse.redirect(`${origin}/today`)
  cookieStore.getAll().forEach(({ name, value }) => {
    response.cookies.set(name, value, { path: '/', httpOnly: true, sameSite: 'lax', secure: true })
  })

  return response
}
