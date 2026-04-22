'use client'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, PlusCircle, Archive, BookOpen,
  MessageSquare, Crown, Leaf, LogOut, Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: React.ElementType; proOnly?: boolean }

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/project/new',  label: 'New Project',   icon: PlusCircle },
  { href: '/inventory',    label: 'Inventory',      icon: Archive },
  { href: '/journal',      label: 'Build Journal',  icon: BookOpen,       proOnly: true },
  { href: '/forum',        label: 'Community',      icon: MessageSquare },
  { href: '/settings',     label: 'Settings',       icon: Settings },
]

const MOBILE_ITEMS: NavItem[] = [
  { href: '/dashboard',   label: 'Home',       icon: LayoutDashboard },
  { href: '/project/new', label: 'New',        icon: PlusCircle },
  { href: '/inventory',   label: 'Inventory',  icon: Archive },
  { href: '/forum',       label: 'Community',  icon: MessageSquare },
  { href: '/settings',    label: 'Settings',   icon: Settings },
]

interface AppNavProps {
  isPro: boolean
  displayName: string
}

export function AppNav({ isPro, displayName }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-[#1f3d0c] h-screen flex-shrink-0">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-5 border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 bg-[#3B6D11] rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-[#C0DD97]" />
          </div>
          <span className="font-serif text-lg text-white tracking-tight">Rootstock</span>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, proOnly }) => {
            const locked = proOnly && !isPro
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={locked ? '/upgrade' : href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all
                  ${active
                    ? 'bg-[#3B6D11] text-white'
                    : 'text-[#C0DD97]/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {locked && <Crown size={11} className="text-amber-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: upgrade prompt + user row */}
        <div className="px-3 pb-5 space-y-2">
          {!isPro && (
            <Link
              href="/upgrade"
              className="block bg-[#3B6D11]/30 border border-[#C0DD97]/20
                rounded-xl p-3 text-center hover:bg-[#3B6D11]/50 transition-colors"
            >
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
            <button
              onClick={handleSignOut}
              className="text-[#C0DD97]/40 hover:text-[#C0DD97] transition-colors"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1f3d0c] border-t border-white/10 flex z-50">
        {MOBILE_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors
                ${active ? 'text-white' : 'text-[#C0DD97]/50 hover:text-[#C0DD97]'}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
