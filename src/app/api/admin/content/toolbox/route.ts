import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper to verify admin access
async function verifyAdmin() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured', status: 500 }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
    return { error: 'Not authorized', status: 403 }
  }

  return { user, profile }
}

// GET: Fetch all toolbox sections with items
export async function GET() {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
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
        is_active,
        items:toolbox_items(id, title, content, sort_order, is_active)
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Toolbox fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch toolbox' }, { status: 500 })
    }

    // Sort items within each section
    const sortedSections = (sections || []).map((section: any) => ({
      ...section,
      items: (section.items || [])
        .filter((item: any) => item.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
    }))

    return NextResponse.json({ sections: sortedSections })
  } catch (err) {
    console.error('Toolbox API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create a new section or item
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { type } = body

    if (type === 'section') {
      const { slug, title, description, icon } = body
      
      // Get max sort_order
      const { data: maxOrder } = await (adminClient as any)
        .from('toolbox_sections')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const sort_order = ((maxOrder as any)?.sort_order ?? -1) + 1

      const { data, error } = await (adminClient as any)
        .from('toolbox_sections')
        .insert({ 
          slug: slug || `section-${Date.now()}`, 
          title, 
          description, 
          icon,
          sort_order 
        })
        .select()
        .single()

      if (error) {
        console.error('Section create error:', error)
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
      }

      return NextResponse.json({ section: data })
    } 
    
    if (type === 'item') {
      const { section_id, title, content } = body
      
      // Get max sort_order for this section
      const { data: maxOrder } = await (adminClient as any)
        .from('toolbox_items')
        .select('sort_order')
        .eq('section_id', section_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const sort_order = ((maxOrder as any)?.sort_order ?? -1) + 1

      const { data, error } = await (adminClient as any)
        .from('toolbox_items')
        .insert({ section_id, title, content, sort_order })
        .select()
        .single()

      if (error) {
        console.error('Item create error:', error)
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
      }

      return NextResponse.json({ item: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Toolbox API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update a section or item
export async function PUT(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { type, id } = body

    if (type === 'section') {
      const { title, description, icon } = body

      const { data, error } = await (adminClient as any)
        .from('toolbox_sections')
        .update({ title, description, icon, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Section update error:', error)
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
      }

      return NextResponse.json({ section: data })
    }
    
    if (type === 'item') {
      const { title, content } = body

      const { data, error } = await (adminClient as any)
        .from('toolbox_items')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Item update error:', error)
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
      }

      return NextResponse.json({ item: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Toolbox API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete a section or item
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
    }

    if (type === 'section') {
      // Soft delete - set is_active to false
      const { error } = await (adminClient as any)
        .from('toolbox_sections')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Section delete error:', error)
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
    
    if (type === 'item') {
      const { error } = await (adminClient as any)
        .from('toolbox_items')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Item delete error:', error)
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Toolbox API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
