import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Survey message sent when conversation is closed
const SURVEY_MESSAGE = `Gracias por comunicarte con Senda. 🙏

Tu bienestar es importante para nosotros. ¿Podrías ayudarnos respondiendo una breve encuesta?

En una escala del 1 al 5, ¿qué tan útil fue esta conversación?
(Responde con un número del 1 al 5)

1 = No me ayudó
5 = Me ayudó mucho

Tu respuesta es anónima y nos ayuda a mejorar. 💙`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const cleanPhone = phoneNumber.replace('whatsapp:', '');

    // Get Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    // Send survey message
    const toWhatsApp = `whatsapp:${cleanPhone}`;
    
    try {
      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: toWhatsApp,
            From: twilioWhatsApp,
            Body: SURVEY_MESSAGE,
          }),
        }
      );

      if (!twilioResponse.ok) {
        console.error('Twilio error sending survey:', await twilioResponse.text());
      }
    } catch (e) {
      console.error('Failed to send survey:', e);
    }

    // Get conversation data BEFORE closing (for stats)
    const { data: conversation } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone_number', cleanPhone)
      .single();

    const closedAt = new Date().toISOString();

    // Update conversation state to pending_delete
    const { error: updateError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .update({
        conversation_state: 'pending_delete',
        status: 'closed',
        closed_at: closedAt,
      })
      .eq('phone_number', cleanPhone);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
    }

    // Save stats IMMEDIATELY when closing (don't wait for survey response)
    if (conversation) {
      const createdAt = new Date(conversation.created_at);
      const closedDate = new Date(closedAt);
      const durationMinutes = Math.round((closedDate.getTime() - createdAt.getTime()) / (1000 * 60));

      // Get volunteer name if assigned
      let volunteerName: string | null = null;
      if (conversation.assigned_to) {
        const { data: volunteer } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', conversation.assigned_to)
          .single();
        volunteerName = volunteer?.full_name || null;
      }

      // Save stats (rating will be updated if user responds to survey)
      const { error: statsError } = await supabaseAdmin
        .from('conversation_stats')
        .insert({
          volunteer_id: conversation.assigned_to,
          volunteer_name: volunteerName,
          crisis_level: conversation.crisis_level,
          rating: null, // Will be updated when user responds to survey
          duration_minutes: durationMinutes,
          closed_at: closedAt,
        });

      if (statsError) {
        console.error('❌ Error saving conversation stats:', statsError);
      } else {
        console.log(`📊 Stats saved: volunteer=${volunteerName}, crisis=${conversation.crisis_level}, duration=${durationMinutes}min`);
      }
    }

    // Note: Deletion is handled by /api/whatsapp/cleanup cron job
    // This allows time for the user to respond to the survey
    console.log(`✅ Conversation ${cleanPhone} marked for deletion (will be cleaned up by cron)`);

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation closed and survey sent'
    });
  } catch (error) {
    console.error('Error closing conversation:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
