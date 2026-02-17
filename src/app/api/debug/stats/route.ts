import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Check if conversation_stats table exists and get all records
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('conversation_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get active conversations
    const { data: conversations, error: convError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('phone_number, conversation_state, assigned_to, crisis_level, created_at, closed_at')
      .limit(10);

    // Get profiles count
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .limit(10);

    return NextResponse.json({
      stats: {
        data: stats,
        error: statsError?.message,
        count: stats?.length || 0
      },
      conversations: {
        data: conversations,
        error: convError?.message,
        count: conversations?.length || 0
      },
      profiles: {
        data: profiles,
        error: profilesError?.message,
        count: profiles?.length || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
