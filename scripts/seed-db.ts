// Seed script to migrate static content to database
// Run with: npx tsx scripts/seed-db.ts

import { createClient } from '@supabase/supabase-js'
import { toolboxData } from '../src/data/toolbox'
import { messages, tags } from '../src/data/messages'
import { resourceCategories } from '../src/data/resources'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efnkpazpexivnpvpgitf.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seedToolbox() {
  console.log('📘 Seeding Toolbox...')
  
  for (let i = 0; i < toolboxData.length; i++) {
    const section = toolboxData[i]
    
    // Check if section exists
    const { data: existingSection } = await supabase
      .from('toolbox_sections')
      .select('id')
      .eq('slug', section.id)
      .single()
    
    let sectionId: string
    
    if (existingSection) {
      sectionId = existingSection.id
      console.log(`  ⏭️ Section exists: ${section.title}`)
    } else {
      const { data: sectionData, error: sectionError } = await supabase
        .from('toolbox_sections')
        .insert({
          slug: section.id,
          title: section.title,
          description: section.description,
          sort_order: i,
          is_active: true
        })
        .select()
        .single()

      if (sectionError) {
        console.error(`  ❌ Error creating section ${section.id}:`, sectionError.message)
        continue
      }
      sectionId = sectionData.id
      console.log(`  ✓ Created section: ${section.title}`)
    }

    // Check existing items count
    const { count: existingItems } = await supabase
      .from('toolbox_items')
      .select('*', { count: 'exact', head: true })
      .eq('section_id', sectionId)
    
    if (existingItems && existingItems > 0) {
      console.log(`    ⏭️ ${existingItems} items already exist`)
      continue
    }

    // Insert items
    let itemsInserted = 0
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j]
      
      const { error: itemError } = await supabase
        .from('toolbox_items')
        .insert({
          section_id: sectionId,
          title: item.title,
          content: item.content,
          sort_order: j,
          is_active: true
        })

      if (itemError) {
        console.error(`    ❌ Error inserting "${item.title}":`, itemError.message)
      } else {
        itemsInserted++
      }
    }
    console.log(`    ✓ Inserted ${itemsInserted} items`)
  }
}

async function seedMessages() {
  console.log('\n💬 Seeding Messages...')
  
  // Check if tags exist
  const { count: existingTagCount } = await supabase
    .from('message_tags')
    .select('*', { count: 'exact', head: true })
  
  if (!existingTagCount || existingTagCount === 0) {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      await supabase
        .from('message_tags')
        .insert({
          slug: tag.id,
          label: tag.label,
          sort_order: i
        })
    }
    console.log(`  ✓ Created ${tags.length} tags`)
  } else {
    console.log(`  ⏭️ ${existingTagCount} tags already exist`)
  }

  // Get tag IDs
  const { data: allTags } = await supabase
    .from('message_tags')
    .select('id, slug')
  
  const tagMap = new Map((allTags || []).map(t => [t.slug, t.id]))

  // Check existing messages
  const { count: existingMsgCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
  
  if (existingMsgCount && existingMsgCount > 0) {
    console.log(`  ⏭️ ${existingMsgCount} messages already exist`)
    return
  }

  // Seed messages
  let messagesInserted = 0
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .insert({
        title: msg.title,
        content: msg.content,
        usage_hint: msg.usage,
        sort_order: i,
        is_active: true
      })
      .select()
      .single()

    if (msgError) {
      console.error(`  ❌ Error inserting "${msg.title}":`, msgError.message)
      continue
    }
    messagesInserted++

    // Link tags
    if (msgData && msg.tags) {
      for (const tagSlug of msg.tags) {
        const tagId = tagMap.get(tagSlug)
        if (tagId) {
          await supabase
            .from('message_tag_relations')
            .insert({
              message_id: msgData.id,
              tag_id: tagId
            })
        }
      }
    }
  }
  console.log(`  ✓ Created ${messagesInserted} messages`)
}

async function seedResources() {
  console.log('\n📁 Seeding Resources...')
  
  for (let i = 0; i < resourceCategories.length; i++) {
    const category = resourceCategories[i]
    
    // Check if category exists
    const { data: existingCat } = await supabase
      .from('resource_categories')
      .select('id')
      .eq('slug', category.id)
      .single()
    
    let categoryId: string
    
    if (existingCat) {
      categoryId = existingCat.id
      console.log(`  ⏭️ Category exists: ${category.title}`)
    } else {
      const { data: catData, error: catError } = await supabase
        .from('resource_categories')
        .insert({
          slug: category.id,
          title: category.title,
          description: category.description || '',
          icon: category.icon,
          sort_order: i,
          is_active: true
        })
        .select()
        .single()

      if (catError) {
        console.error(`  ❌ Error creating category ${category.id}:`, catError.message)
        continue
      }
      categoryId = catData.id
      console.log(`  ✓ Created category: ${category.title}`)
    }

    // Check existing resources
    const { count: existingRes } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
    
    if (existingRes && existingRes > 0) {
      console.log(`    ⏭️ ${existingRes} resources already exist`)
      continue
    }

    // Insert resources
    let resourcesInserted = 0
    for (let j = 0; j < category.resources.length; j++) {
      const resource = category.resources[j]
      
      const { error } = await supabase
        .from('resources')
        .insert({
          category_id: categoryId,
          title: resource.title,
          description: resource.description || '',
          resource_type: resource.type,
          contact: resource.contact || null,
          link: resource.link || null,
          sort_order: j,
          is_active: true
        })

      if (error) {
        console.error(`    ❌ Error inserting "${resource.title}":`, error.message)
      } else {
        resourcesInserted++
      }
    }
    console.log(`    ✓ Inserted ${resourcesInserted} resources`)
  }
}

async function main() {
  console.log('🌱 Starting database seed...\n')
  
  await seedToolbox()
  await seedMessages()
  await seedResources()
  
  console.log('\n✅ Database seeded successfully!')
}

main().catch(console.error)
