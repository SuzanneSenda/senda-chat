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

    // Update conversation state to pending_delete
    const { error: updateError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .update({
        conversation_state: 'pending_delete',
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('phone_number', cleanPhone);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
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
