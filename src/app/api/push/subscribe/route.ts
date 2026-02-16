import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// VAPID public key - must match the one used in frontend
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BCsw-fS9IvCyazprf7GoljG8ZFD7siunFz_rgfB66EmClp4XEA1Gu4i1KnWZmy7jERvpNUyCL3H26LUCm63U0YU';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Save subscription to user's profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        push_subscription: subscription,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error saving subscription:', updateError);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    console.log(`✅ Push subscription saved for user ${user.id}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get VAPID public key
export async function GET() {
  return NextResponse.json({ 
    publicKey: VAPID_PUBLIC_KEY 
  });
}
