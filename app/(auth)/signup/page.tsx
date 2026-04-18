'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/app/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-[#1f3d0c] rounded-xl flex items-center justify-center">
            <Leaf size={16} className="text-[#C0DD97]" />
          </div>
          <span className="font-serif text-xl text-[#1f3d0c]">Rootstock</span>
        </div>
        <div className="card p-7">
          <h1 className="font-serif text-xl text-[#1f3d0c] mb-1">Create your account</h1>
          <p className="text-xs text-[#6b6b58] mb-6">
            Free — 2 projects included, no credit card needed
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Homesteader"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="min. 8 characters"
                  required
                  minLength={8}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b58]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f3d0c] text-[#C0DD97] font-medium py-2.5
                rounded-xl hover:bg-[#3B6D11] transition-colors text-sm disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-xs text-[#6b6b58] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#3B6D11] hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-[#6b6b58]/50 mt-3 leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}