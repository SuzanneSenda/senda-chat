import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ conversations: [], error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ conversations: [], error: 'Not authorized' }, { status: 403 });
    }

    // Build query - filter by role
    let query = supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .in('conversation_state', ['waiting_for_volunteer', 'assigned'])
      .order('last_message_at', { ascending: false });

    // Role-based filtering
    if (profile.role === 'supervisor') {
      // Supervisors see all conversations
      // No additional filter
    } else {
      // Volunteers see:
      // 1. Unassigned conversations (waiting_for_volunteer)
      // 2. Conversations assigned to them
      query = query.or(`conversation_state.eq.waiting_for_volunteer,assigned_to.eq.${profile.id}`);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ conversations: [] });
    }

    // Format response
    const formattedConversations = (conversations || []).map((conv, index) => ({
      phone_number: conv.phone_number,
      contact_name: conv.contact_name,
      last_message: conv.last_message,
      last_message_at: conv.last_message_at,
      unread_count: conv.unread_count || 0,
      anonymous_id: `Persona ${index + 1}`,
      crisis_level: conv.crisis_level,
      conversation_state: conv.conversation_state,
      assigned_to: conv.assigned_to,
      assigned_name: null,
      filter_passed: conv.filter_passed
    }));

    return NextResponse.json({ 
      conversations: formattedConversations,
      userRole: profile.role,
      userId: profile.id
    });

  } catch (error) {
    console.error('Error in conversations:', error);
    return NextResponse.json({ conversations: [] });
  }
}
