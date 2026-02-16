import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Singleton client to maintain session across the app
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured - auth will not work')
    return null as any
  }

  // Return existing client if already created
  if (client) {
    return client
  }

  // Create new client
  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return client
}
