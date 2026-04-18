import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, Archive, BookOpen, MessageSquare, Crown, Leaf, LogOut } from 'lucide-react'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  const isPro = sub?.tier === 'pro'
  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Homesteader'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EE]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#1f3d0c] h-screen flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-[#3B6D11] rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-[#C0DD97]" />
          </div>
          <span className="font-serif text-lg text-white tracking-tight">Rootstock</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {[
            { href: '/app/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
            { href: '/app/project/new', label: 'New Project',  icon: PlusCircle },
            { href: '/app/inventory',   label: 'Inventory',    icon: Archive },
            { href: '/app/journal',     label: 'Build Journal',icon: BookOpen,      proOnly: true },
            { href: '/app/forum',       label: 'Forum',        icon: MessageSquare },
          ].map(({ href, label, icon: Icon, proOnly }) => {
            const locked = proOnly && !isPro
            return (
              <Link key={href} href={locked ? '/app/upgrade' : href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                  transition-all text-[#C0DD97]/70 hover:text-white hover:bg-white/10">
                <Icon size={15} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {locked && <Crown size={11} className="text-amber-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-2">
          {!isPro && (
            <Link href="/app/upgrade"
              className="block bg-[#3B6D11]/30 border border-[#C0DD97]/20
                rounded-xl p-3 text-center hover:bg-[#3B6D11]/50 transition-colors">
              <Crown size={14} className="text-amber-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-[#C0DD97]">Upgrade to Pro</p>
              <p className="text-xs text-[#C0DD97]/50 mt-0.5">$9 / month</p>
            </Link>
          )}
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-6 h-6 rounded-full bg-[#3B6D11] flex items-center
              justify-center text-xs text-[#C0DD97] font-medium flex-shrink-0">
              {displayName[0].toUpperCase()}
            </div>
            <span className="text-xs text-[#C0DD97]/70 flex-1 truncate">{displayName}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-[#C0DD97]/40 hover:text-[#C0DD97]">
                <LogOut size={13} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}