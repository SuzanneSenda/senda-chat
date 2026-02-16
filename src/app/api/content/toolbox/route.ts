import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public read-only endpoint for toolbox content
export async function GET() {
  try {
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: sections, error } = await (adminClient as any)
      .from('toolbox_sections')
      .select(`
        id,
        slug,
        title,
        description,
        icon,
        sort_order,
        items:toolbox_items(id, title, content, sort_order, is_active)
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Toolbox fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch toolbox' }, { status: 500 })
    }

    // Sort items and filter active ones
    const sortedSections = (sections || []).map((section: any) => ({
      id: section.slug,
      title: section.title,
      description: section.description,
      items: (section.items || [])
        .filter((item: any) => item.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((item: any) => ({
          title: item.title,
          content: item.content
        }))
    }))

    return NextResponse.json({ sections: sortedSections })
  } catch (err) {
    console.error('Toolbox API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
