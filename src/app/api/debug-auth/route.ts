import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};
  
  try {
    // Check server-side auth
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    results.serverAuth = {
      hasUser: !!user,
      userId: user?.id || null,
      email: user?.email || null,
      error: userError?.message || null,
    };
    
    // If we have a user, try to get their profile
    if (user) {
      // Try with user's session
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status')
        .eq('id', user.id)
        .maybeSingle();
      
      results.profileViaUser = {
        data: profileData,
        error: profileError?.message || null,
      };
      
      // Try with admin client (bypasses RLS)
      const { data: adminProfileData, error: adminProfileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, role, status')
        .eq('id', user.id)
        .maybeSingle();
      
      results.profileViaAdmin = {
        data: adminProfileData,
        error: adminProfileError?.message || null,
      };
    }
    
    // Check if profile exists by email
    const emailParam = request.nextUrl.searchParams.get('email');
    if (emailParam) {
      const { data: byEmail, error: byEmailError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, role, status')
        .eq('email', emailParam)
        .maybeSingle();
      
      results.profileByEmail = {
        data: byEmail,
        error: byEmailError?.message || null,
      };
    }
    
  } catch (err: any) {
    results.exception = err.message;
  }
  
  return NextResponse.json(results);
}
