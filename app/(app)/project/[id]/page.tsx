import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProjectGuide } from '@/lib/ai'
import { ShieldCheck, Wrench, CheckCircle2, AlertTriangle, Lightbulb, PhoneCall } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects').select('*')
    .eq('id', params.id).eq('user_id', user.id)
    .single()

  if (!project) notFound()

  const guide = project.guide_json as ProjectGuide

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <Link href="/dashboard" className="text-xs text-[#6b6b58] hover:text-[#1f3d0c] mb-4 block">
          ← Back to projects
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl text-[#1f3d0c] mb-2">{guide.title}</h1>
        <div className="flex flex-wrap gap-3 text-xs text-[#6b6b58]">
          <span>⏱ {guide.estimated_time}</span>
          <span>·</span>
          <span>📊 {guide.difficulty}</span>
        </div>
        <p className="text-sm text-[#6b6b58] mt-3 leading-relaxed">{guide.overview}</p>
      </div>

      {/* Safety */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-red-600" />
          <h2 className="font-medium text-red-800 text-sm">Safety Checklist</h2>
        </div>
        <ul className="space-y-2">
          {guide.safety_checklist.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tools */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={16} className="text-[#3B6D11]" />
          <h2 className="font-medium text-[#1f3d0c] text-sm">Tools & Materials</h2>
        </div>
        <div className="space-y-3">
          {guide.tools_list.map((tool, i) => (
            <div key={i} className="border-b border-[#5C4A2A]/10 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[#1f3d0c]">
                  {tool.name}
                  {tool.quantity && <span className="text-[#6b6b58] font-normal"> × {tool.quantity}</span>}
                </p>
                {tool.macguyver_sub && (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                    🔧 Sub available
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6b6b58] mt-0.5">{tool.why}</p>
              {tool.macguyver_sub && (
                <p className="text-xs text-amber-700 mt-1">↳ {tool.macguyver_sub}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h2 className="font-serif text-xl text-[#1f3d0c] mb-4">Step-by-Step Guide</h2>
        <div className="space-y-4">
          {guide.steps.map((step) => (
            <div key={step.number} className="card p-5">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#1f3d0c] text-[#C0DD97] text-xs
                  font-medium flex items-center justify-center shrink-0 mt-0.5">
                  {step.number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium text-[#1f3d0c] text-sm">{step.title}</h3>
                    {step.time_estimate && (
                      <span className="text-xs text-[#6b6b58] shrink-0">⏱ {step.time_estimate}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#6b6b58] leading-relaxed">{step.details}</p>
                  {step.warning && (
                    <div className="flex gap-2 mt-2 bg-red-50 rounded-xl p-2.5">
                      <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{step.warning}</p>
                    </div>
                  )}
                  {step.pro_tip && (
                    <div className="flex gap-2 mt-2 bg-[#EAF3DE] rounded-xl p-2.5">
                      <Lightbulb size={13} className="text-[#3B6D11] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#3B6D11]">{step.pro_tip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      {guide.pro_tips.length > 0 && (
        <div className="card p-5">
          <h2 className="font-medium text-[#1f3d0c] text-sm mb-3">💡 Pro Tips</h2>
          <ul className="space-y-2">
            {guide.pro_tips.map((tip, i) => (
              <li key={i} className="text-sm text-[#6b6b58] flex gap-2">
                <span className="shrink-0 text-[#3B6D11]">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* When to call a pro */}
      <div className="bg-[#1f3d0c] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <PhoneCall size={15} className="text-[#C0DD97]" />
          <h2 className="font-medium text-white text-sm">When to Call a Pro</h2>
        </div>
        <p className="text-sm text-[#C0DD97]/80 leading-relaxed">{guide.when_to_call_pro}</p>
      </div>

      {/* Seasonal notes */}
      {guide.seasonal_notes && (
        <div className="card p-5">
          <h2 className="font-medium text-[#1f3d0c] text-sm mb-2">🗓 Seasonal Notes</h2>
          <p className="text-sm text-[#6b6b58]">{guide.seasonal_notes}</p>
        </div>
      )}

    </div>
  )
}