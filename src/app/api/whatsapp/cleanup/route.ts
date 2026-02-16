import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cleanup old pending_delete conversations (run via cron every minute)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find conversations in pending_delete state that are older than 5 minutes
    // (Extended time for emergency situations - allows lookup of phone numbers)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: toDelete, error: selectError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('phone_number')
      .eq('conversation_state', 'pending_delete')
      .lt('closed_at', fiveMinutesAgo);

    if (selectError) {
      console.error('Error finding conversations to delete:', selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (!toDelete || toDelete.length === 0) {
      return NextResponse.json({ deleted: 0, message: 'No conversations to clean up' });
    }

    let deletedCount = 0;
    
    for (const conv of toDelete) {
      // Delete messages (except survey responses)
      await supabaseAdmin
        .from('whatsapp_messages')
        .delete()
        .eq('phone_number', conv.phone_number)
        .neq('status', 'survey_response');

      // Delete conversation
      const { error: deleteError } = await supabaseAdmin
        .from('whatsapp_conversations')
        .delete()
        .eq('phone_number', conv.phone_number);

      if (!deleteError) {
        deletedCount++;
        console.log(`🗑️ Cleaned up conversation: ${conv.phone_number}`);
      }
    }

    return NextResponse.json({ 
      deleted: deletedCount,
      message: `Cleaned up ${deletedCount} conversations`
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
