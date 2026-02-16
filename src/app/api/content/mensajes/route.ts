import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public read-only endpoint for messages content
export async function GET() {
  try {
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Fetch tags
    const { data: tags } = await (adminClient as any)
      .from('message_tags')
      .select('id, slug, label, sort_order')
      .order('sort_order')

    // Fetch messages with tag relations
    const { data: messages, error } = await (adminClient as any)
      .from('messages')
      .select(`
        id,
        title,
        content,
        usage_hint,
        sort_order,
        message_tag_relations(tag_id)
      `)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Messages fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Map tag IDs to slugs
    const tagMap = new Map((tags || []).map((t: any) => [t.id, t.slug]))
    
    const formattedMessages = (messages || []).map((m: any) => ({
      title: m.title,
      content: m.content,
      usage: m.usage_hint,
      tags: (m.message_tag_relations || [])
        .map((r: any) => tagMap.get(r.tag_id))
        .filter(Boolean)
    }))

    const formattedTags = (tags || []).map((t: any) => ({
      id: t.slug,
      label: t.label
    }))

    return NextResponse.json({ messages: formattedMessages, tags: formattedTags })
  } catch (err) {
    console.error('Messages API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
