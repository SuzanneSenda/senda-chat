import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify user is supervisor
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null };

    if (!profile || profile.role !== 'supervisor') {
      return NextResponse.json({ error: 'Only supervisors can reset data' }, { status: 403 });
    }

    // Verify confirmation code
    const body = await request.json();
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation code' }, { status: 400 });
    }

    // Use admin client for deletions
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    const results: any = {};

    // Delete all WhatsApp messages
    const { error: messagesError } = await adminClient
      .from('whatsapp_messages')
      .delete()
      .gte('created_at', '1970-01-01'); // Delete all rows

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      results.messages = 'error';
    } else {
      results.messages = 'deleted';
    }

    // Delete all WhatsApp conversations
    const { error: convsError } = await adminClient
      .from('whatsapp_conversations')
      .delete()
      .gte('created_at', '1970-01-01'); // Delete all rows

    if (convsError) {
      console.error('Error deleting conversations:', convsError);
      results.conversations = 'error';
    } else {
      results.conversations = 'deleted';
    }

    // Log the reset action
    console.log(`[RESET] Data reset by user ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Datos eliminados correctamente',
      results 
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
