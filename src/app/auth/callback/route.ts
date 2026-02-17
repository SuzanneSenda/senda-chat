import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/voluntarios'

  console.log('[callback] Starting auth callback')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[callback] User:', user?.id, user?.email)
      
      if (user) {
        // Use admin client to bypass RLS for all profile operations
        const adminClient = createAdminClient()
        
        if (!adminClient) {
          console.error('[callback] Admin client not available - SUPABASE_SERVICE_ROLE_KEY missing?')
          return NextResponse.redirect(`${origin}/auth/login?error=Error de configuración del servidor`)
        }
        
        // Check if profile exists using admin client
        const { data: existingProfile, error: profileCheckError } = await adminClient
          .from('profiles')
          .select('id, status')
          .eq('id', user.id)
          .single()
        
        console.log('[callback] Profile check:', existingProfile, profileCheckError?.message)
        
        // Create profile if it doesn't exist (new user)
        if (!existingProfile) {
          console.log('[callback] Creating new profile for user:', user.id)
          
          const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              status: 'pending' as const,
              role: 'voluntario' as const,
              avatar_url: null,
              phone: null,
              last_sign_in: null
            })
          
          if (profileError) {
            console.error('[callback] Error creating profile:', profileError)
            return NextResponse.redirect(`${origin}/auth/login?error=callback:create_failed:${profileError.code}:${profileError.message}`)
          }
          
          console.log('[callback] Profile created successfully, redirecting to pending')
          // New user - redirect directly to pending page
          return NextResponse.redirect(`${origin}/auth/pending`)
        }
        
        // Existing user - check their status
        if (existingProfile.status === 'pending') {
          return NextResponse.redirect(`${origin}/auth/pending`)
        }
        
        if (existingProfile.status === 'inactive') {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/auth/login?error=Tu cuenta ha sido desactivada`)
        }
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('[callback] Code exchange error:', error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
