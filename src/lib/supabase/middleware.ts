import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Allow access to auth routes to show "not configured" message
    // For now, allow all routes during development
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/voluntarios')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isPendingPage = request.nextUrl.pathname === '/auth/pending'
  const isLogoutRoute = request.nextUrl.pathname === '/auth/logout'
  const isCallbackRoute = request.nextUrl.pathname === '/auth/callback'
  
  // Always allow logout and callback routes to execute without profile check
  // Callback needs to run first to create profile for new users
  if (isLogoutRoute || isCallbackRoute) {
    return supabaseResponse
  }

  if (isProtectedRoute && !user) {
    // Redirect to login if not authenticated
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check if user is approved (status = 'active') and profile exists
  if (isProtectedRoute && user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()
    
    // Profile doesn't exist - user was deleted
    if (profileError || !profile) {
      // Sign out and redirect to login
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('error', `Sin perfil (middleware:protected) - ${profileError?.message || 'profile null'}`)
      return NextResponse.redirect(url)
    }
    
    if (profile.status === 'pending') {
      // Redirect to pending approval page
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending'
      return NextResponse.redirect(url)
    }
    
    if (profile.status === 'inactive') {
      // Sign out and redirect to login with error
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('error', 'Tu cuenta ha sido desactivada')
      return NextResponse.redirect(url)
    }
  }

  if (isAuthRoute && !isPendingPage && user) {
    // Check status before redirecting to dashboard
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()
    
    // Profile doesn't exist - user was deleted, sign them out
    if (profileError || !profile) {
      console.log('[middleware] No profile on auth route:', profileError?.message)
      await supabase.auth.signOut()
      return supabaseResponse // Let them stay on auth page
    }
    
    if (profile.status === 'pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending'
      return NextResponse.redirect(url)
    }
    
    if (profile.status === 'inactive') {
      // Sign them out
      await supabase.auth.signOut()
      return supabaseResponse
    }
    
    if (profile.status === 'active') {
      // Redirect to dashboard if already logged in and approved
      const url = request.nextUrl.clone()
      url.pathname = '/voluntarios'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
