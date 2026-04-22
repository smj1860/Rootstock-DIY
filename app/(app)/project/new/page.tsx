'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown, RefreshCw } from 'lucide-react'
import { CATEGORIES, SUBCATEGORIES } from '@/lib/constants'

const LOADING_STEPS = [
  'Analyzing your project...',
  'Consulting safety protocols...',
  'Writing your step-by-step guide...',
  'Adding expert tips and tool list...',
  'Finalizing your guide...',
]

export default function NewProjectPage() {
  const router = useRouter()
  const [category, setCategory]       = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [description, setDescription] = useState('')
  const [skillLevel, setSkillLevel]   = useState<'beginner'|'intermediate'|'advanced'>('intermediate')
  const [macguyver, setMacguyver]     = useState(false)
  const [inventory, setInventory]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [loadStep, setLoadStep]       = useState(0)
  const [error, setError]             = useState<string|null>(null)

  useEffect(() => {
    if (!loading) { setLoadStep(0); return }
    const id = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 5000)
    return () => clearInterval(id)
  }, [loading])

  const subcats = SUBCATEGORIES.filter(s => s.categoryId === category)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !description.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subcategory: subcategory || undefined,
          description,
          skillLevel,
          macguyver,
          inventory: macguyver
            ? inventory.split(',').map(s => s.trim()).filter(Boolean)
            : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/project/${data.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-[#1f3d0c] mb-1">New Project</h1>
        <p className="text-sm text-[#6b6b58]">Describe your project and Rootstock will build your guide.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div className="relative">
            <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory('') }}
              required className="input appearance-none pr-8">
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b58] pointer-events-none" />
          </div>
        </div>

        {/* Subcategory */}
        {subcats.length > 0 && (
          <div>
            <label className="label">Subcategory <span className="text-[#6b6b58] font-normal">(optional)</span></label>
            <div className="relative">
              <select value={subcategory} onChange={e => setSubcategory(e.target.value)}
                className="input appearance-none pr-8">
                <option value="">Select a subcategory...</option>
                {subcats.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b58] pointer-events-none" />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="label">Describe your project</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="E.g. I want to install a 200-watt solar panel on my shed roof to power a chest freezer and some lights. I have a south-facing roof with no shade..."
            className="textarea"
          />
          <p className="text-xs text-[#6b6b58] mt-1">More detail = better guide. Include your situation, goals, and any constraints.</p>
        </div>

        {/* Skill Level */}
        <div>
          <label className="label">Your skill level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['beginner','intermediate','advanced'] as const).map(level => (
              <button key={level} type="button"
                onClick={() => setSkillLevel(level)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize
                  ${skillLevel === level
                    ? 'bg-[#1f3d0c] text-[#C0DD97] border-[#1f3d0c]'
                    : 'bg-white text-[#1f3d0c] border-[#5C4A2A]/20 hover:border-[#3B6D11]'
                  }`}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* MacGuyver Mode */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-[#1f3d0c]">🔧 MacGuyver Mode</p>
              <p className="text-xs text-[#6b6b58]">Use what you already own</p>
            </div>
            <button type="button" onClick={() => setMacguyver(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors
                ${macguyver ? 'bg-[#3B6D11]' : 'bg-[#5C4A2A]/20'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${macguyver ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {macguyver && (
            <div className="mt-3">
              <label className="label">What do you have on hand?</label>
              <input type="text" value={inventory}
                onChange={e => setInventory(e.target.value)}
                placeholder="e.g. drill, 2x4 lumber, come-along, baling wire..."
                className="input"
              />
              <p className="text-xs text-[#6b6b58] mt-1">Comma-separated list of tools and materials you own.</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Something went wrong</p>
            <p className="text-xs text-red-600 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-red-700
                hover:text-red-900 transition-colors"
            >
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="card p-6 text-center">
            {/* Step label */}
            <p className="text-sm font-medium text-[#1f3d0c] mb-4 min-h-[1.25rem] transition-all">
              {LOADING_STEPS[loadStep]}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-[#5C4A2A]/10 rounded-full h-1.5 mb-4">
              <div
                className="bg-[#3B6D11] h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${((loadStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-1.5">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-500
                    ${i <= loadStep ? 'bg-[#3B6D11]' : 'bg-[#5C4A2A]/20'}`}
                />
              ))}
            </div>

            <p className="text-xs text-[#6b6b58] mt-4">This takes 15–30 seconds</p>
          </div>
        )}

        {!loading && (
          <button type="submit" disabled={!category || !description.trim()}
            className="w-full bg-[#1f3d0c] text-[#C0DD97] font-medium py-3 rounded-xl
              hover:bg-[#3B6D11] transition-colors text-sm disabled:opacity-50
              flex items-center justify-center gap-2">
            <ArrowRight size={15} /> Generate Guide
          </button>
        )}
      </form>
    </div>
  )
}