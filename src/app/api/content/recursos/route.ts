import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public read-only endpoint for resources content
export async function GET() {
  try {
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: categories, error } = await (adminClient as any)
      .from('resource_categories')
      .select(`
        id,
        slug,
        title,
        description,
        icon,
        sort_order,
        resources:resources(id, title, description, resource_type, contact, link, sort_order, is_active)
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Resources fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
    }

    // Format to match existing structure
    const formattedCategories = (categories || []).map((cat: any) => ({
      id: cat.slug,
      title: cat.title,
      description: cat.description,
      icon: cat.icon,
      resources: (cat.resources || [])
        .filter((r: any) => r.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((r: any) => ({
          title: r.title,
          description: r.description,
          type: r.resource_type,
          contact: r.contact,
          link: r.link
        }))
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (err) {
    console.error('Resources API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
