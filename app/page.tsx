import Link from 'next/link'
import { Leaf, ArrowRight, ShieldCheck, Wrench, List, Users, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  { icon: '🌿', label: 'Landscape & Gardening' },
  { icon: '🍳', label: 'Cooking & Baking' },
  { icon: '🫙', label: 'Canning' },
  { icon: '🔧', label: 'Auto & Small Engine' },
  { icon: '🚿', label: 'Plumbing' },
  { icon: '⚡', label: 'Electrical' },
  { icon: '☀️', label: 'Solar' },
  { icon: '🐄', label: 'Animals & Livestock' },
  { icon: '🪵', label: 'Building & Renovation' },
  { icon: '🌱', label: 'Other Self-Sufficiency' },
]

const FEATURES = [
  { icon: ShieldCheck, color: 'bg-red-50 text-red-600',    title: 'Safety first',            body: 'Critical warnings and environment prep before you ever pick up a tool.' },
  { icon: Wrench,      color: 'bg-blue-50 text-blue-600',  title: 'Master tool list',         body: 'Precise hardware and tool recommendations with direct links to top-rated supplies.' },
  { icon: List,        color: 'bg-green-50 text-green-700',title: 'Step-by-step execution',   body: 'AI instructions tailored to your specific skill level, start to finish.' },
  { icon: Users,       color: 'bg-amber-50 text-amber-700',title: 'Pro hand-off',             body: 'One-click referrals to licensed local contractors for complex builds.' },
  { icon: TrendingUp,  color: 'bg-purple-50 text-purple-600',title: 'Feedback loop',          body: 'Ask follow-up questions in real time if you get stuck on any step.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE]">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1f3d0c] rounded-lg flex items-center justify-center">
            <Leaf size={15} className="text-[#C0DD97]" />
          </div>
          <span className="font-serif text-lg text-[#1f3d0c]">Rootstock</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#6b6b58] hover:text-[#1f3d0c] transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm font-medium bg-[#1f3d0c] text-[#C0DD97] px-4 py-2 rounded-xl hover:bg-[#3B6D11] transition-colors">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <p className="text-xs font-medium tracking-widest text-[#3B6D11] uppercase mb-4">AI-Powered Homesteading</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#1f3d0c] leading-tight mb-5">
          Master your homestead with{' '}
          <span className="text-[#3B6D11]">AI-powered</span> precision.
        </h1>
        <p className="text-[#6b6b58] text-lg leading-relaxed mb-8">
          Expert DIY instructions, tool lists, and pro-contractor referrals for every project — from building a shed to canning your harvest.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#1f3d0c] text-[#C0DD97] font-medium px-6 py-3.5 rounded-2xl hover:bg-[#3B6D11] transition-colors text-sm">
            Start free — 2 projects included <ArrowRight size={15} />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-[#1f3d0c] font-medium px-6 py-3.5 rounded-2xl border border-[#5C4A2A]/15 hover:bg-[#EAF3DE] transition-colors text-sm">
            Sign in
          </Link>
        </div>
        <p className="text-xs text-[#6b6b58]/60 mt-4">Free tier: 2 projects · Pro: unlimited for $9/month</p>
      </section>

      {/* Features */}
      <section className="bg-white/60 px-6 py-16 border-y border-[#5C4A2A]/8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium tracking-widest text-[#3B6D11] uppercase text-center mb-2">How it works</p>
          <h2 className="font-serif text-2xl text-[#1f3d0c] text-center mb-10">Stop guessing. Start growing.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="bg-white border border-[#5C4A2A]/10 rounded-2xl p-5 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon size={17} />
                </div>
                <h3 className="font-medium text-[#1f3d0c] text-sm mb-1">{title}</h3>
                <p className="text-xs text-[#6b6b58] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <p className="text-xs font-medium tracking-widest text-[#3B6D11] uppercase text-center mb-2">Featured categories</p>
        <h2 className="font-serif text-2xl text-[#1f3d0c] text-center mb-8">Built for every corner of your land.</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map(({ icon, label }) => (
            <div key={label} className="border border-[#5C4A2A]/10 rounded-2xl p-3 text-center bg-white hover:border-[#3B6D11] transition-colors">
              <span className="text-2xl block mb-1.5">{icon}</span>
              <span className="text-xs font-medium text-[#1f3d0c] leading-tight block">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto bg-[#1f3d0c] rounded-3xl p-8 text-center">
          <h2 className="font-serif text-2xl text-white mb-3">Go Pro for $9/month</h2>
          <p className="text-[#C0DD97]/80 text-sm mb-6 leading-relaxed">
            Unlimited projects · MacGuyver inventory mode · Build journal · Priority support
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#C0DD97] text-[#1f3d0c] font-medium px-6 py-3 rounded-2xl hover:bg-white transition-colors text-sm">
            Get started free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#5C4A2A]/10 px-6 py-8 text-center">
        <p className="text-xs text-[#6b6b58]/60 max-w-lg mx-auto leading-relaxed">
          © 2026 Rootstock. All rights reserved.{' '}
          <strong className="font-medium">Affiliate disclosure:</strong> As an affiliate, we may earn a commission from qualifying purchases made through links on this site.
        </p>
      </footer>
    </main>
  )
}