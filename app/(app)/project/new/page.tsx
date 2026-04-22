'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf, Loader2, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, SUBCATEGORIES } from '@/lib/constants'

export default function NewProjectPage() {
  const router = useRouter()
  const [category, setCategory]       = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [description, setDescription] = useState('')
  const [skillLevel, setSkillLevel]   = useState<'beginner'|'intermediate'|'advanced'>('intermediate')
  const [macguyver, setMacguyver]     = useState(false)
  const [inventory, setInventory]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string|null>(null)

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
      router.push(`/app/project/${data.id}`)
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
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !category || !description.trim()}
          className="w-full bg-[#1f3d0c] text-[#C0DD97] font-medium py-3 rounded-xl
            hover:bg-[#3B6D11] transition-colors text-sm disabled:opacity-50
            flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Generating your guide...</>
            : <><ArrowRight size={15} /> Generate Guide</>
          }
        </button>

        {loading && (
          <p className="text-center text-xs text-[#6b6b58]">
            This takes 15–30 seconds. Rootstock is building your expert guide...
          </p>
        )}
      </form>
    </div>
  )
}