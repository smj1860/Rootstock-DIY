import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProjectGuide, ProjectGuideInput } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check free tier limit
    const { data: sub } = await supabase
      .from('subscriptions').select('tier')
      .eq('user_id', user.id).single()
    const isPro = sub?.tier === 'pro'

    if (!isPro) {
      const { count } = await supabase
        .from('projects').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if ((count ?? 0) >= 2)
        return NextResponse.json({ error: 'Free tier limit reached' }, { status: 403 })
    }

    const input: ProjectGuideInput = await req.json()
    const guide = await generateProjectGuide(input)

    // Save to Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id:     user.id,
        title:       guide.title,
        category:    input.category,
        subcategory: input.subcategory ?? null,
        description: input.description,
        guide_json:  guide,
        steps:       guide.steps,
        is_complete: false,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: project.id })

  } catch (err: any) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: err.message ?? 'Generation failed' }, { status: 500 })
  }
}