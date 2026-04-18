import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Clock, CheckCircle2, ChevronRight, Crown } from 'lucide-react'

const FREE_TIER_LIMIT = 2

const CATEGORY_ICONS: Record<string, string> = {
  landscape: '🌿', cooking: '🍳', canning: '🫙', auto: '🔧',
  plumbing: '🚿', electrical: '⚡', solar: '☀️', animals: '🐄',
  building: '🪵', 'self-sufficiency': '🌱',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default async function Dashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  const isPro = sub?.tier === 'pro'
  const atLimit = !isPro && (projects?.length ?? 0) >= FREE_TIER_LIMIT

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#1f3d0c]">My Projects</h1>
          {!isPro && (
            <p className="text-sm text-[#6b6b58] mt-1">
              {projects?.length ?? 0} / {FREE_TIER_LIMIT} free projects used
            </p>
          )}
        </div>
        <Link href={atLimit ? '/app/upgrade' : '/app/project/new'}
          className="flex items-center gap-2 bg-[#1f3d0c] text-[#C0DD97]
            font-medium px-4 py-2.5 rounded-xl hover:bg-[#3B6D11]
            transition-colors text-sm">
          <PlusCircle size={15} />
          {atLimit ? 'Upgrade for more' : 'New project'}
        </Link>
      </div>

      {/* Empty state */}
      {(!projects || projects.length === 0) && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🌱</p>
          <p className="font-serif text-lg text-[#1f3d0c] mb-2">Start your first project</p>
          <p className="text-sm text-[#6b6b58] mb-6">Pick a category and let Rootstock guide you.</p>
          <Link href="/app/project/new"
            className="inline-flex items-center gap-2 bg-[#1f3d0c] text-[#C0DD97]
              font-medium px-5 py-2.5 rounded-xl hover:bg-[#3B6D11] transition-colors text-sm">
            <PlusCircle size={15} /> Create first project
          </Link>
        </div>
      )}

      {/* Project grid */}
      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project.id} href={`/app/project/${project.id}`}
              className="card p-5 block hover:shadow-md transition-all
                hover:-translate-y-0.5 group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xl">{CATEGORY_ICONS[project.category] ?? '🌱'}</span>
                {project.is_complete
                  ? <span className="flex items-center gap-1 text-xs text-[#3B6D11] font-medium"><CheckCircle2 size={12} /> Done</span>
                  : <span className="flex items-center gap-1 text-xs text-[#6b6b58]"><Clock size={12} /> In progress</span>
                }
              </div>
              <h3 className="font-serif text-base text-[#1f3d0c] mb-1 leading-snug line-clamp-2">
                {project.title}
              </h3>
              <p className="text-xs text-[#6b6b58] mb-3">{timeAgo(project.created_at)}</p>
              {project.description && (
                <p className="text-xs text-[#6b6b58] line-clamp-2 mb-4 leading-relaxed">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A0845C]">{project.steps?.length ?? 0} steps</span>
                <ChevronRight size={14} className="text-[#3B6D11] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Upgrade banner */}
      {atLimit && (
        <div className="mt-8 bg-[#1f3d0c] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-serif text-white text-lg">Unlock unlimited projects</p>
            <p className="text-[#C0DD97] text-sm mt-1">Upgrade to Pro for $9/month — MacGuyver mode included.</p>
          </div>
          <Link href="/app/upgrade"
            className="bg-[#C0DD97] text-[#1f3d0c] font-medium px-5 py-2.5
              rounded-xl text-sm hover:bg-white transition-colors flex items-center gap-2">
            <Crown size={14} /> Upgrade →
          </Link>
        </div>
      )}
    </div>
  )
}