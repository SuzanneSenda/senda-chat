import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { toolboxData } from '@/data/toolbox'
import { messages, tags } from '@/data/messages'
import { resourceCategories } from '@/data/resources'

// This endpoint seeds the database with initial content
// Only supervisors can run this
export async function POST() {
  try {
    const authClient = await createClient()
    if (!authClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Verify admin/supervisor role
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null }

    if (!profile || profile.role !== 'supervisor') {
      return NextResponse.json({ error: 'Only supervisors can seed data' }, { status: 403 })
    }

    // Use admin client for seeding to bypass type restrictions
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    const results: Record<string, unknown> = { toolbox: {}, messages: {}, resources: {} }

    // === SEED TOOLBOX ===
    for (let i = 0; i < toolboxData.length; i++) {
      const section = toolboxData[i]
      
      // Insert section
      const { data: sectionData, error: sectionError } = await supabase
        .from('toolbox_sections')
        .upsert({
          slug: section.id,
          title: section.title,
          description: section.description,
          sort_order: i,
          is_active: true
        }, { onConflict: 'slug' })
        .select()
        .single()

      if (sectionError) {
        console.error('Section error:', sectionError)
        continue
      }

      // Insert items for this section
      for (let j = 0; j < section.items.length; j++) {
        const item = section.items[j]
        await supabase
          .from('toolbox_items')
          .upsert({
            section_id: sectionData.id,
            title: item.title,
            content: item.content,
            sort_order: j,
            is_active: true
          }, { onConflict: 'section_id,title' })
      }
    }
    results.toolbox = { sections: toolboxData.length }

    // === SEED MESSAGE TAGS ===
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      await supabase
        .from('message_tags')
        .upsert({
          slug: tag.id,
          label: tag.label,
          sort_order: i
        }, { onConflict: 'slug' })
    }

    // === SEED MESSAGES ===
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .upsert({
          title: msg.title,
          content: msg.content,
          usage_hint: msg.usage,
          sort_order: i,
          is_active: true
        }, { onConflict: 'title' })
        .select()
        .single()

      if (msgError || !msgData) continue

      // Link tags
      for (const tagSlug of msg.tags) {
        const { data: tagData } = await supabase
          .from('message_tags')
          .select('id')
          .eq('slug', tagSlug)
          .single()

        if (tagData) {
          await supabase
            .from('message_tag_relations')
            .upsert({
              message_id: msgData.id,
              tag_id: tagData.id
            }, { onConflict: 'message_id,tag_id' })
        }
      }
    }
    results.messages = { count: messages.length, tags: tags.length }

    // === SEED RESOURCES ===
    for (let i = 0; i < resourceCategories.length; i++) {
      const category = resourceCategories[i]
      
      const { data: catData, error: catError } = await supabase
        .from('resource_categories')
        .upsert({
          slug: category.id,
          title: category.title,
          description: category.description,
          icon: category.icon,
          sort_order: i,
          is_active: true
        }, { onConflict: 'slug' })
        .select()
        .single()

      if (catError || !catData) continue

      // Insert resources
      for (let j = 0; j < category.resources.length; j++) {
        const resource = category.resources[j]
        await supabase
          .from('resources')
          .upsert({
            category_id: catData.id,
            title: resource.title,
            description: resource.description,
            resource_type: resource.type,
            contact: resource.contact || null,
            link: resource.link || null,
            sort_order: j,
            is_active: true
          }, { onConflict: 'category_id,title' })
      }
    }
    results.resources = { categories: resourceCategories.length }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: 'Seed failed', details: String(err) }, { status: 500 })
  }
}
