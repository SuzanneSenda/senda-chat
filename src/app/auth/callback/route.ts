import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/voluntarios'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        
        // Create profile if it doesn't exist (new user)
        if (!existingProfile) {
          // Use admin client to bypass RLS for profile creation
          const adminClient = createAdminClient()
          
          if (adminClient) {
            const { error: profileError } = await adminClient
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                status: 'pending', // New users need approval
                role: 'voluntario',
                created_at: new Date().toISOString()
              })
            
            if (profileError) {
              console.error('Error creating profile:', profileError)
            }
          } else {
            // Fallback to regular client (may fail due to RLS)
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                status: 'pending',
                role: 'voluntario',
                created_at: new Date().toISOString()
              })
            
            if (profileError) {
              console.error('Error creating profile (fallback):', profileError)
            }
          }
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
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
