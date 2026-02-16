import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

export async function GET(request: NextRequest) {
  const results: string[] = [];
  
  // Check Twilio credentials
  results.push(`TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING'}`);
  results.push(`TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN ? 'SET' : 'MISSING'}`);
  results.push(`TWILIO_WHATSAPP_NUMBER: ${TWILIO_WHATSAPP_NUMBER}`);
  
  // Get active volunteers with phone
  const { data: volunteers, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, status')
    .eq('status', 'active')
    .not('phone', 'is', null);
  
  results.push(`Volunteers with phone: ${JSON.stringify(volunteers)}`);
  
  if (error) {
    results.push(`Error: ${error.message}`);
  }
  
  // Send test notification to ALL volunteers with phone
  if (volunteers && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    for (const volunteer of volunteers) {
      if (!volunteer.phone) continue;
      
      const cleanPhone = volunteer.phone.replace(/\D/g, '');
      const toWhatsApp = `whatsapp:+${cleanPhone}`;
      
      results.push(`Sending test to ${volunteer.full_name}: ${toWhatsApp}`);
      
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
              Body: `🧪 Test para ${volunteer.full_name} - ${new Date().toLocaleTimeString()}` 
            }),
          }
        );
        
        const result = await response.json();
        results.push(`${volunteer.full_name}: ${result.status || result.message}`);
      } catch (e: any) {
        results.push(`${volunteer.full_name} error: ${e.message}`);
      }
    }
  } else {
    results.push('Cannot send test: missing credentials or no volunteers');
  }
  
  return NextResponse.json({ results });
}
