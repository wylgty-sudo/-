'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setupUser } from '@/lib/actions/auth'

function ExchangeInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      router.replace('/login?error=' + encodeURIComponent(error))
      return
    }

    const supabase = createClient()

    // Let Supabase client handle the code exchange automatically via _initialize.
    // We just listen for the result instead of calling exchangeCodeForSession manually.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        await setupUser(session.user.email, session.user.id)
        router.replace('/today')
      } else if (event === 'INITIAL_SESSION' && !session) {
        router.replace('/login?error=auth_failed')
      }
    })

    return () => subscription.unsubscribe()
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
