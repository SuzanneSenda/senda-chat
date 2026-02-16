import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  
  try {
    const supabase = await createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
  
  // Redirect to login with cache prevention
  const response = NextResponse.redirect(`${origin}/auth/login`, {
    status: 302,
  })
  
  // Clear any auth-related cookies
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
  
  // Prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  
  return response
}

export async function POST(request: Request) {
  return GET(request)
}
