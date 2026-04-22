import Link from 'next/link'
import { Leaf, ArrowRight, ShieldCheck, Wrench, List, Users, TrendingUp, Star, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  { icon: '🌿', label: 'Landscape & Gardening',   desc: 'Beds, fences, irrigation' },
  { icon: '🍳', label: 'Cooking & Baking',         desc: 'Recipes, preservation' },
  { icon: '🫙', label: 'Canning & Preserving',     desc: 'Water bath, pressure canning' },
  { icon: '🔧', label: 'Auto & Small Engine',      desc: 'Repairs, maintenance' },
  { icon: '🚿', label: 'Plumbing',                 desc: 'Pipes, fixtures, wells' },
  { icon: '⚡', label: 'Electrical',               desc: 'Wiring, panels, code' },
  { icon: '☀️', label: 'Solar & Off-Grid',         desc: 'Panels, batteries, inverters' },
  { icon: '🐄', label: 'Animals & Livestock',      desc: 'Coops, pens, husbandry' },
  { icon: '🪵', label: 'Building & Renovation',    desc: 'Sheds, barns, framing' },
  { icon: '🌱', label: 'Self-Sufficiency',          desc: 'Foraging, prep, skills' },
]

const FEATURES = [
  { icon: ShieldCheck, bg: 'bg-red-50',    fg: 'text-red-600',    title: 'Safety first',          body: 'Critical warnings and site prep before you ever pick up a tool.' },
  { icon: Wrench,      bg: 'bg-blue-50',   fg: 'text-blue-600',   title: 'Exact tool list',        body: 'Hardware and tool specs tailored to your exact project and scale.' },
  { icon: List,        bg: 'bg-green-50',  fg: 'text-green-700',  title: 'Step-by-step guide',     body: 'AI instructions calibrated to your skill level, start to finish.' },
  { icon: TrendingUp,  bg: 'bg-purple-50', fg: 'text-purple-600', title: 'Chat follow-up',         body: 'Ask follow-up questions mid-project and get instant expert answers.' },
  { icon: Users,       bg: 'bg-amber-50',  fg: 'text-amber-700',  title: 'Pro hand-off',           body: 'One-click referrals to licensed local contractors when you need them.' },
]

const TESTIMONIALS = [
  { name: 'Marcus T.', role: 'Hobby farmer, Tennessee', quote: 'Built a 400 sq ft chicken coop from scratch. The guide covered framing, ventilation, and predator-proofing — nothing I would have thought to include myself.' },
  { name: 'Priya S.',  role: 'Homesteader, Oregon',     quote: "I pressure-canned for the first time using Rootstock. The safety checklist alone was worth it — I didn't blow up my kitchen." },
  { name: 'Dale R.',   role: 'Off-grid builder, Montana', quote: 'The solar guide walked me through a 2kW battery bank wiring plan step by step. Saved me at least $800 in consultant fees.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE]">

      {/* ── Nav ── */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1f3d0c] rounded-lg flex items-center justify-center">
            <Leaf size={15} className="text-[#C0DD97]" />
          </div>
          <span className="font-serif text-lg text-[#1f3d0c]">Rootstock</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#6b6b58] hover:text-[#1f3d0c] transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm font-medium bg-[#1f3d0c] text-[#C0DD97] px-4 py-2 rounded-xl hover:bg-[#3B6D11] transition-colors">Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle radial glow behind headline */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-[#3B6D11]/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#5C4A2A]/12 rounded-full px-4 py-2 mb-8 shadow-sm">
            <div className="flex -space-x-1">
              {['M','P','D','R','S'].map(l => (
                <div key={l} className="w-5 h-5 rounded-full bg-[#3B6D11] border-2 border-white
                  flex items-center justify-center text-[8px] font-bold text-[#C0DD97]">{l}</div>
              ))}
            </div>
            <span className="text-xs text-[#6b6b58]">Joined by <strong className="text-[#1f3d0c]">2,400+</strong> homesteaders</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
            </div>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#1f3d0c] leading-[1.08] mb-6">
            Build anything.<br />
            <span className="text-[#3B6D11]">Know everything.</span>
          </h1>
          <p className="text-[#6b6b58] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Rootstock generates expert-level, step-by-step DIY guides for every corner of your homestead — solar systems, livestock pens, canning, plumbing, and more — powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#1f3d0c] text-[#C0DD97]
                font-semibold px-7 py-4 rounded-2xl hover:bg-[#3B6D11] transition-colors text-sm shadow-lg shadow-[#1f3d0c]/20"
            >
              Start free — 2 projects included <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1f3d0c]
                font-medium px-7 py-4 rounded-2xl border border-[#5C4A2A]/15 hover:bg-[#EAF3DE] transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-[#6b6b58]/60">No credit card · Free tier: 2 projects · Pro: $9/month</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white/70 border-y border-[#5C4A2A]/8 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-[#3B6D11] uppercase text-center mb-3">How it works</p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1f3d0c] text-center mb-4">
            Stop guessing. Start building.
          </h2>
          <p className="text-[#6b6b58] text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Describe your project in plain English. Rootstock writes the guide, lists every tool, and flags every safety concern — in under 30 seconds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, bg, fg, title, body }) => (
              <div key={title} className="bg-white border border-[#5C4A2A]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} ${fg} flex items-center justify-center mb-4`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-[#1f3d0c] text-sm mb-2">{title}</h3>
                <p className="text-xs text-[#6b6b58] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-xs font-semibold tracking-widest text-[#3B6D11] uppercase text-center mb-3">What you can build</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#1f3d0c] text-center mb-12">
          Every corner of your land, covered.
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map(({ icon, label, desc }) => (
            <Link
              key={label}
              href="/signup"
              className="group border border-[#5C4A2A]/10 rounded-2xl p-4 text-center bg-white
                hover:border-[#3B6D11] hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-3xl block mb-2">{icon}</span>
              <span className="text-xs font-semibold text-[#1f3d0c] leading-tight block mb-1">{label}</span>
              <span className="text-[10px] text-[#6b6b58] leading-tight block">{desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white/70 border-y border-[#5C4A2A]/8 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-[#3B6D11] uppercase text-center mb-3">Real projects</p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1f3d0c] text-center mb-12">
            Built with Rootstock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, quote }) => (
              <div key={name} className="bg-white border border-[#5C4A2A]/10 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-[#6b6b58] leading-relaxed mb-5 italic">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1f3d0c] flex items-center justify-center
                    text-xs font-bold text-[#C0DD97]">{name[0]}</div>
                  <div>
                    <p className="text-xs font-semibold text-[#1f3d0c]">{name}</p>
                    <p className="text-[10px] text-[#6b6b58]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ── */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1f3d0c] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C0DD97] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C0DD97] rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            </div>
            <div className="relative">
              <p className="text-[#C0DD97]/70 text-xs font-semibold tracking-widest uppercase mb-4">Pricing</p>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
                Start free. Go Pro when you&apos;re ready.
              </h2>
              <p className="text-[#C0DD97]/70 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Free tier gets you 2 full projects — no credit card. Pro unlocks everything for less than a trip to the hardware store.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-[#C0DD97] text-[#1f3d0c]
                    font-semibold px-7 py-3.5 rounded-2xl hover:bg-white transition-colors text-sm">
                  Start free <ArrowRight size={15} />
                </Link>
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white
                    font-medium px-7 py-3.5 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors text-sm">
                  Pro — $9/month
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-xs text-[#C0DD97]/60">
                {['Unlimited projects', 'MacGuyver inventory mode', 'Build journal', 'Chat follow-up'].map(f => (
                  <span key={f} className="flex items-center gap-1.5 justify-center">
                    <CheckCircle size={12} className="text-[#C0DD97]/50" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#5C4A2A]/10 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1f3d0c] rounded-md flex items-center justify-center">
              <Leaf size={11} className="text-[#C0DD97]" />
            </div>
            <span className="font-serif text-sm text-[#1f3d0c]">Rootstock</span>
          </div>
          <p className="text-xs text-[#6b6b58]/60 text-center max-w-sm leading-relaxed">
            © 2026 Rootstock. All rights reserved.{' '}
            <strong className="font-medium">Affiliate disclosure:</strong> We may earn a commission from qualifying purchases.
          </p>
          <div className="flex gap-4 text-xs text-[#6b6b58]/60">
            <Link href="/login" className="hover:text-[#1f3d0c] transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-[#1f3d0c] transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
