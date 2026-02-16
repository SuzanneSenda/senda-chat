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

    // Get user profile - ONLY supervisors can transfer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (profile.role !== 'supervisor') {
      return NextResponse.json({ error: 'Only supervisors can transfer conversations' }, { status: 403 });
    }

    const { phoneNumber, toVolunteerId } = await request.json();

    if (!phoneNumber || !toVolunteerId) {
      return NextResponse.json({ error: 'Missing phoneNumber or toVolunteerId' }, { status: 400 });
    }

    // Verify target volunteer exists and is active
    const { data: targetVolunteer, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, status')
      .eq('id', toVolunteerId)
      .single();

    if (targetError || !targetVolunteer) {
      return NextResponse.json({ error: 'Target volunteer not found' }, { status: 404 });
    }

    if (targetVolunteer.status !== 'active') {
      return NextResponse.json({ error: 'Target volunteer is not active' }, { status: 400 });
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

    // Transfer conversation
    const { error: updateError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .update({
        assigned_to: toVolunteerId,
        assigned_at: new Date().toISOString(),
        conversation_state: 'assigned'
      })
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error('Error transferring conversation:', updateError);
      return NextResponse.json({ error: 'Failed to transfer' }, { status: 500 });
    }

    // Log the transfer
    await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        phone_number: phoneNumber,
        sender_name: 'Sistema',
        message_body: `Conversación transferida a ${targetVolunteer.full_name} por ${profile.full_name}`,
        direction: 'outbound',
        status: 'system_note'
      });

    console.log(`🔄 Conversation ${phoneNumber} transferred to ${targetVolunteer.full_name} by ${profile.full_name}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation transferred',
      transferredTo: toVolunteerId,
      transferredToName: targetVolunteer.full_name
    });

  } catch (error) {
    console.error('Transfer conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get list of volunteers to transfer to
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile - ONLY supervisors can see transfer list
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'supervisor') {
      return NextResponse.json({ error: 'Only supervisors can transfer' }, { status: 403 });
    }

    // Get all active volunteers
    const { data: volunteers, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, is_on_duty')
      .eq('status', 'active')
      .order('full_name');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
    }

    return NextResponse.json({ volunteers: volunteers || [] });

  } catch (error) {
    console.error('Get volunteers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
