import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'

// Types for database entities
interface Resource {
  id: string
  title: string
  description: string | null
  resource_type: string
  contact: string | null
  link: string | null
  sort_order: number
  is_active: boolean
}

interface ResourceCategory {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  resources?: Resource[]
}

interface SortOrderResult {
  sort_order: number
}

// Helper to verify admin access
async function verifyAdmin(): Promise<{ error: string; status: number } | { user: { id: string }; profile: { role: string } }> {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase not configured', status: 500 }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
    return { error: 'Not authorized', status: 403 }
  }

  return { user, profile }
}

// GET: Fetch all resource categories with resources
export async function GET() {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient() as SupabaseClient
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const { data: categories, error } = await adminClient
      .from('resource_categories')
      .select(`
        id,
        slug,
        title,
        description,
        icon,
        sort_order,
        is_active,
        resources:resources(id, title, description, resource_type, contact, link, sort_order, is_active)
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Resources fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
    }

    // Sort resources within each category and filter active
    const sortedCategories = (categories as ResourceCategory[] || []).map((category) => ({
      ...category,
      resources: (category.resources || [])
        .filter((r) => r.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
    }))

    return NextResponse.json({ categories: sortedCategories })
  } catch (err) {
    console.error('Resources API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create a new category or resource
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient() as SupabaseClient
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { type } = body

    if (type === 'category') {
      const { slug, title, description, icon } = body
      
      const { data: maxOrder } = await adminClient
        .from('resource_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const sort_order = ((maxOrder as SortOrderResult | null)?.sort_order ?? -1) + 1

      const { data, error } = await adminClient
        .from('resource_categories')
        .insert({ 
          slug: slug || `category-${Date.now()}`, 
          title, 
          description, 
          icon,
          sort_order 
        })
        .select()
        .single()

      if (error) {
        console.error('Category create error:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
      }

      return NextResponse.json({ category: data })
    } 
    
    if (type === 'resource') {
      const { category_id, title, description, resource_type, contact, link } = body
      
      const { data: maxOrder } = await adminClient
        .from('resources')
        .select('sort_order')
        .eq('category_id', category_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const sort_order = ((maxOrder as SortOrderResult | null)?.sort_order ?? -1) + 1

      const { data, error } = await adminClient
        .from('resources')
        .insert({ category_id, title, description, resource_type, contact, link, sort_order })
        .select()
        .single()

      if (error) {
        console.error('Resource create error:', error)
        return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 })
      }

      return NextResponse.json({ resource: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Resources API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update a category or resource
export async function PUT(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient() as SupabaseClient
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { type, id } = body

    if (type === 'category') {
      const { title, description, icon } = body

      const { data, error } = await adminClient
        .from('resource_categories')
        .update({ title, description, icon, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Category update error:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
      }

      return NextResponse.json({ category: data })
    }
    
    if (type === 'resource') {
      const { title, description, resource_type, contact, link } = body

      const { data, error } = await adminClient
        .from('resources')
        .update({ title, description, resource_type, contact, link, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Resource update error:', error)
        return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 })
      }

      return NextResponse.json({ resource: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Resources API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete a category or resource
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createAdminClient() as SupabaseClient
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
    }

    if (type === 'category') {
      const { error } = await adminClient
        .from('resource_categories')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Category delete error:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
    
    if (type === 'resource') {
      const { error } = await adminClient
        .from('resources')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Resource delete error:', error)
        return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Resources API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
