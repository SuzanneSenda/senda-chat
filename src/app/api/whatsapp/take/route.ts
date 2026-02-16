import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Missing phoneNumber' }, { status: 400 });
    }

    // Get conversation
    const { data: conv, error: convError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if already assigned
    if (conv.assigned_to && conv.conversation_state === 'assigned') {
      return NextResponse.json({ 
        error: 'Conversation already assigned',
        assignedTo: conv.assigned_to 
      }, { status: 409 });
    }

    // Assign to current user
    const { error: updateError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .update({
        assigned_to: profile.id,
        assigned_at: new Date().toISOString(),
        conversation_state: 'assigned',
        unread_count: 0
      })
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error('Error assigning conversation:', updateError);
      return NextResponse.json({ error: 'Failed to assign' }, { status: 500 });
    }

    console.log(`✅ Conversation ${phoneNumber} assigned to ${profile.full_name}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation assigned',
      assignedTo: profile.id,
      assignedName: profile.full_name
    });

  } catch (error) {
    console.error('Take conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
