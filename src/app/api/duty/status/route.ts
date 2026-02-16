import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_on_duty')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ isOnDuty: false });
    }

    return NextResponse.json({ isOnDuty: profile?.is_on_duty || false });
  } catch (error) {
    console.error('Error in duty status:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
