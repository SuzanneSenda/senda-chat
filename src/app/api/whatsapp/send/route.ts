import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });
    }

    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox default

    if (!accountSid || !authToken) {
      console.error('Twilio credentials not configured');
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    // Format phone number for WhatsApp
    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Send via Twilio
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
          Body: message,
        }),
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioData);
      return NextResponse.json({ 
        error: 'Failed to send message',
        details: twilioData.message || 'Unknown error'
      }, { status: 500 });
    }

    // Store outbound message in database
    const messageData = {
      phone_number: to.replace('whatsapp:', ''),
      sender_name: 'Senda Chat',
      message_body: message,
      twilio_sid: twilioData.sid,
      direction: 'outbound',
      status: 'sent',
      volunteer_id: user.id,
    };

    // Try admin client first (bypasses RLS), fall back to regular client
    const dbClient = adminClient || supabase;
    console.log('[send] Using admin client:', !!adminClient, 'volunteer_id:', user.id);
    
    const { error: dbError } = await (dbClient as any)
      .from('whatsapp_messages')
      .insert(messageData);

    if (dbError) {
      console.error('[send] Error storing message:', dbError);
      // Don't fail - message was sent via Twilio
    } else {
      console.log('[send] Message stored successfully with volunteer_id:', user.id);
    }

    return NextResponse.json({ 
      success: true, 
      messageSid: twilioData.sid 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
