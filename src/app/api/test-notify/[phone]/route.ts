import { NextRequest, NextResponse } from 'next/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return NextResponse.json({ error: 'Twilio not configured' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const toWhatsApp = `whatsapp:+${cleanPhone}`;
  
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ 
          To: toWhatsApp, 
          From: TWILIO_WHATSAPP_NUMBER, 
          Body: `🧪 Test directo - ${new Date().toLocaleTimeString()}` 
        }),
      }
    );
    
    const result = await response.json();
    return NextResponse.json({ 
      to: toWhatsApp,
      status: result.status,
      error: result.message,
      sid: result.sid
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
