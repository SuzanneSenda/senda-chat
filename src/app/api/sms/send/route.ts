import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });
    }

    // Get Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSms = process.env.TWILIO_SMS_NUMBER;

    if (!accountSid || !authToken || !twilioSms) {
      console.error('Twilio SMS credentials not configured');
      return NextResponse.json({ error: 'SMS not configured' }, { status: 500 });
    }

    // Format phone number (ensure it has + prefix)
    const toNumber = to.startsWith('+') ? to : `+${to}`;

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
          To: toNumber,
          From: twilioSms,
          Body: message,
        }),
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio SMS error:', twilioData);
      return NextResponse.json({ 
        error: 'Failed to send message',
        details: twilioData.message || 'Unknown error'
      }, { status: 500 });
    }

    // Store outbound message in database
    const { error: dbError } = await supabase
      .from('sms_messages')
      .insert({
        phone_number: to.replace('+', ''),
        sender_name: 'Senda Chat',
        message_body: message,
        twilio_sid: twilioData.sid,
        direction: 'outbound',
        status: 'sent',
        volunteer_id: user.id,
      });

    if (dbError) {
      console.error('Error storing SMS:', dbError);
      // Don't fail - message was sent
    }

    return NextResponse.json({ 
      success: true, 
      messageSid: twilioData.sid 
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
