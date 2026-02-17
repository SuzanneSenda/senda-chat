import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'

// Types for database entities
interface MessageTag {
  id: string
  slug: string
  label: string
  sort_order: number
}

interface MessageTagRelation {
  tag_id: string
}

interface Message {
  id: string
  title: string
  content: string
  usage_hint: string | null
  sort_order: number
  is_active: boolean
  message_tag_relations?: MessageTagRelation[]
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

// GET: Fetch all messages with their tags
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

    // Fetch tags
    const { data: tags, error: tagsError } = await adminClient
      .from('message_tags')
      .select('id, slug, label, sort_order')
      .order('sort_order')

    if (tagsError) {
      console.error('Tags fetch error:', tagsError)
    }

    // Fetch messages with tag relations
    const { data: messages, error } = await adminClient
      .from('messages')
      .select(`
        id,
        title,
        content,
        usage_hint,
        sort_order,
        is_active,
        message_tag_relations(tag_id)
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Messages fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Map tag IDs to tag slugs
    const tagMap = new Map((tags as MessageTag[] || []).map((t) => [t.id, t.slug]))
    
    const messagesWithTags = (messages as Message[] || []).map((m) => ({
      ...m,
      tags: (m.message_tag_relations || []).map((r) => tagMap.get(r.tag_id)).filter(Boolean)
    }))

    return NextResponse.json({ messages: messagesWithTags, tags: tags || [] })
  } catch (err) {
    console.error('Messages API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create a new message or tag
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

    if (type === 'tag') {
      const { slug, label } = body
      
      const { data: maxOrder } = await adminClient
        .from('message_tags')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const sort_order = ((maxOrder as SortOrderResult | null)?.sort_order ?? -1) + 1

      const { data, error } = await adminClient
        .from('message_tags')
        .insert({ slug: slug || `tag-${Date.now()}`, label, sort_order })
        .select()
        .single()

      if (error) {
        console.error('Tag create error:', error)
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
      }

      return NextResponse.json({ tag: data })
    }

    if (type === 'message') {
      const { title, content, usage_hint, tags: tagSlugs } = body
      
      const { data: maxOrder } = await adminClient
        .from('messages')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const sort_order = ((maxOrder as SortOrderResult | null)?.sort_order ?? -1) + 1

      const { data: message, error } = await adminClient
        .from('messages')
        .insert({ title, content, usage_hint, sort_order })
        .select()
        .single()

      if (error) {
        console.error('Message create error:', error)
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
      }

      // Link tags if provided
      if (tagSlugs && tagSlugs.length > 0) {
        const { data: allTags } = await adminClient
          .from('message_tags')
          .select('id, slug')
        
        const tagMap = new Map((allTags as MessageTag[] || []).map((t) => [t.slug, t.id]))
        
        const tagRelations = (tagSlugs as string[])
          .map((slug) => tagMap.get(slug))
          .filter(Boolean)
          .map((tagId) => ({ message_id: (message as Message).id, tag_id: tagId }))
        
        if (tagRelations.length > 0) {
          await adminClient
            .from('message_tag_relations')
            .insert(tagRelations)
        }
      }

      return NextResponse.json({ message })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Messages API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update a message or tag
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

    if (type === 'tag') {
      const { label } = body

      const { data, error } = await adminClient
        .from('message_tags')
        .update({ label })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Tag update error:', error)
        return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
      }

      return NextResponse.json({ tag: data })
    }

    if (type === 'message') {
      const { title, content, usage_hint, tags: tagSlugs } = body

      const { data, error } = await adminClient
        .from('messages')
        .update({ title, content, usage_hint, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Message update error:', error)
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
      }

      // Update tag relations if provided
      if (tagSlugs !== undefined) {
        // Remove existing relations
        await adminClient
          .from('message_tag_relations')
          .delete()
          .eq('message_id', id)
        
        // Add new relations
        if (tagSlugs.length > 0) {
          const { data: allTags } = await adminClient
            .from('message_tags')
            .select('id, slug')
          
          const tagMap = new Map((allTags as MessageTag[] || []).map((t) => [t.slug, t.id]))
          
          const tagRelations = (tagSlugs as string[])
            .map((slug) => tagMap.get(slug))
            .filter(Boolean)
            .map((tagId) => ({ message_id: id, tag_id: tagId }))
          
          if (tagRelations.length > 0) {
            await adminClient
              .from('message_tag_relations')
              .insert(tagRelations)
          }
        }
      }

      return NextResponse.json({ message: data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Messages API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete a message or tag
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

    if (type === 'tag') {
      // Hard delete tag (cascade will remove relations)
      const { error } = await adminClient
        .from('message_tags')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Tag delete error:', error)
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (type === 'message') {
      const { error } = await adminClient
        .from('messages')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Message delete error:', error)
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Messages API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
