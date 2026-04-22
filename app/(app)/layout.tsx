import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNav } from './_components/AppNav'
import { HeaderBar } from './_components/HeaderBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).single(),
    supabase.from('subscriptions').select('tier').eq('user_id', user.id).single(),
  ])

  const isPro = sub?.tier === 'pro'
  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Homesteader'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EE]">
      <AppNav isPro={isPro} displayName={displayName} />

      {/* Right column: header + scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderBar displayName={displayName} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
