'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setupUser } from '@/lib/actions/auth'

function ExchangeInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      router.replace('/login?error=' + encodeURIComponent(error))
      return
    }
    if (!code) {
      router.replace('/login?error=no_code')
      return
    }

    async function exchange() {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.exchangeCodeForSession(code!)
      if (err) {
        router.replace('/login?error=' + encodeURIComponent(err.message))
        return
      }
      if (data.user?.email) {
        await setupUser(data.user.email, data.user.id)
      }
      router.replace('/today')
    }

    exchange()
  }, [])

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center">
      <p className="text-text-muted text-sm">正在登录，请稍候...</p>
    </div>
  )
}

export default function ExchangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <p className="text-text-muted text-sm">正在登录，请稍候...</p>
      </div>
    }>
      <ExchangeInner />
    </Suspense>
  )
}
