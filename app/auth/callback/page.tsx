import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage() {
  const supabase = await createClient()

  const { searchParams } = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  const code = searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  redirect('/admin')
}
