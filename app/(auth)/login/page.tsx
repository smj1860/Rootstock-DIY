'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
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
          <h1 className="font-serif text-xl text-[#1f3d0c] mb-1">Welcome back</h1>
          <p className="text-xs text-[#6b6b58] mb-6">Sign in to your homestead</p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
                  required
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-xs text-[#6b6b58] mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#3B6D11] hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}