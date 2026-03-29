import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // Build the response first, then set cookies directly on it
  const successResponse = NextResponse.redirect(`${origin}/today`)
  const failResponse = (msg: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options ?? {})
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user?.email) {
    return failResponse(error?.message ?? 'no_user')
  }

  // Auto-add first user or admin email to allowed_users
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

  return successResponse
}
