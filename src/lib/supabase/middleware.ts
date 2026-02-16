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
  
  // Always allow logout route to execute
  if (isLogoutRoute) {
    return supabaseResponse
  }

  if (isProtectedRoute && !user) {
    // Redirect to login if not authenticated
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check if user is approved (status = 'active')
  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()
    
    if (profile?.status === 'pending') {
      // Redirect to pending approval page
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending'
      return NextResponse.redirect(url)
    }
    
    if (profile?.status === 'inactive') {
      // Redirect to login with error
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('error', 'Tu cuenta ha sido desactivada')
      return NextResponse.redirect(url)
    }
  }

  if (isAuthRoute && !isPendingPage && user) {
    // Check status before redirecting to dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()
    
    if (profile?.status === 'pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending'
      return NextResponse.redirect(url)
    }
    
    if (profile?.status === 'active') {
      // Redirect to dashboard if already logged in and approved
      const url = request.nextUrl.clone()
      url.pathname = '/voluntarios'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
