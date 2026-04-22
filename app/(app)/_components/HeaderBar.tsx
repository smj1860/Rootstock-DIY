'use client'
import { usePathname } from 'next/navigation'

const TITLES: [string, string][] = [
  ['/project/new', 'New Project'],
  ['/project/',    'Project Guide'],
  ['/inventory',   'Inventory'],
  ['/journal',     'Build Journal'],
  ['/forum',       'Community'],
  ['/upgrade',     'Upgrade to Pro'],
  ['/settings',    'Settings'],
  ['/dashboard',   'My Projects'],
]

export function HeaderBar({ displayName }: { displayName: string }) {
  const pathname = usePathname()
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Rootstock'

  return (
    <header className="bg-[#F7F4EE] border-b border-[#5C4A2A]/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <h2 className="font-serif text-lg text-[#1f3d0c]">{title}</h2>
      <div className="w-8 h-8 rounded-full bg-[#C0DD97] flex items-center justify-center
        text-sm font-semibold text-[#1f3d0c] select-none">
        {displayName[0].toUpperCase()}
      </div>
    </header>
  )
}
