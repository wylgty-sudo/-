import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookiesToSet: { name: string; value: string; options?: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(incoming: { name: string; value: string; options?: any }[]) {
          incoming.forEach((c) => cookiesToSet.push(c))
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

  // Return HTML page that sets cookies then redirects — avoids 302+Set-Cookie issues
  const html = `<!DOCTYPE html><html><head>
<script>window.location.replace('${origin}/today')</script>
</head><body>正在跳转...</body></html>`

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options ?? {})
  })

  return response
}
