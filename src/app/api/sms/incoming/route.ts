import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Twilio credentials
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID; // Messaging Service for Sticky Sender

// Crisis level messages
const CRISIS_LEVELS = [
  "1️⃣ Un poco abrumado/a",
  "2️⃣ Necesito apoyo",
  "3️⃣ En crisis, necesito ayuda",
  "4️⃣ En peligro, ayuda ahora",
  "5️⃣ Riesgo vital, ayuda urgente"
];

// Waiting messages
const WAITING_MESSAGES = [
  "Gracias por escribirnos. Estamos conectándote con alguien de nuestro equipo.",
  "Tu bienestar es importante para nosotros. En un momento te atendemos.",
  "No estás solo/a. Alguien estará contigo pronto.",
  "Gracias por tu paciencia. Un voluntario te responderá en breve.",
  "Estamos aquí para ti. Dame un momento mientras te conecto con alguien."
];

// Emergency contacts
const EMERGENCY_MESSAGE = `Gracias por comunicarte.

Si estás pasando por un momento difícil y necesitas apoyo inmediato:

SAPTEL (24/7): 55 5259 8121
Línea de la Vida: 800-911-2000

Recuerda que no estás solo/a. En estas líneas de apoyo estamos para ti, mereces ser escuchado.`;

// Check if SMS channel is enabled
async function isSmsEnabled(): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'channel_config')
      .single();
    
    return data?.value?.sms_enabled ?? false;
  } catch {
    return false;
  }
}

// Send SMS via Twilio using Messaging Service (for Sticky Sender)
async function sendSms(to: string, message: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_MESSAGING_SERVICE_SID) {
    console.error('Twilio SMS credentials not configured (need TWILIO_MESSAGING_SERVICE_SID)');
    return false;
  }

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
          To: to,
          MessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error('Twilio SMS error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

// Store outbound message
async function storeOutboundMessage(phoneNumber: string, body: string, status: string = 'sent') {
  await supabaseAdmin
    .from('sms_messages')
    .insert({
      phone_number: phoneNumber,
      sender_name: 'Senda Chat',
      message_body: body,
      direction: 'outbound',
      status
    });
}

export async function POST(request: NextRequest) {
  try {
    // Check if SMS is enabled
    const enabled = await isSmsEnabled();
    if (!enabled) {
      console.log('📵 SMS channel is disabled');
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Twilio sends form-urlencoded data
    const formData = await request.formData();
    
    // Extract message data from Twilio webhook
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    
    // Clean phone number (SMS doesn't have whatsapp: prefix)
    const phoneNumber = from?.replace('+', '') || '';
    const trimmedBody = body?.trim() || '';
    
    console.log('📱 Incoming SMS:', { phoneNumber, body: trimmedBody.substring(0, 50) });

    // Check for existing conversation
    const { data: existingConv } = await supabaseAdmin
      .from('sms_conversations')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    // Handle based on conversation state
    if (!existingConv) {
      // NEW CONVERSATION - Create and send filter question
      await supabaseAdmin
        .from('sms_conversations')
        .insert({
          phone_number: phoneNumber,
          contact_name: 'Usuario',
          last_message: trimmedBody,
          last_message_at: new Date().toISOString(),
          conversation_state: 'awaiting_filter',
          unread_count: 1,
          channel: 'sms'
        });

      // Store first message
      await supabaseAdmin
        .from('sms_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      // Send filter question
      const filterQuestion = "Hola, gracias por escribir a Senda Chat.\n\nAntes de conectarte con un voluntario:\n\n¿Cuántos picos tiene un Maguen David?";
      
      await sendSms(from, filterQuestion);
      await storeOutboundMessage(phoneNumber, filterQuestion, 'filter_question');

      console.log('🆕 New SMS conversation, sent filter question');

    } else if (existingConv.conversation_state === 'awaiting_filter') {
      // CHECK FILTER ANSWER
      const answer = trimmedBody.toLowerCase();
      const isCorrect = answer === '6' || answer === 'seis' || answer === 'seis.' || answer === '6.';

      // Store answer
      await supabaseAdmin
        .from('sms_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      if (isCorrect) {
        // PASSED - Ask for crisis level
        await supabaseAdmin
          .from('sms_conversations')
          .update({
            conversation_state: 'awaiting_crisis_level',
            filter_passed: true,
            last_message: trimmedBody,
            last_message_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber);

        const crisisQuestion = `Gracias!\n\n¿Cómo te sientes?\n\n${CRISIS_LEVELS.join('\n')}\n\nResponde 1-5:`;
        
        await sendSms(from, crisisQuestion);
        await storeOutboundMessage(phoneNumber, crisisQuestion, 'crisis_question');

        console.log('✅ Filter passed, sent crisis level question');

      } else {
        // FAILED - Send warm message with emergency contacts
        await supabaseAdmin
          .from('sms_conversations')
          .update({
            conversation_state: 'closed',
            filter_passed: false,
            last_message: trimmedBody,
            last_message_at: new Date().toISOString(),
            closed_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber);

        await sendSms(from, EMERGENCY_MESSAGE);
        await storeOutboundMessage(phoneNumber, EMERGENCY_MESSAGE, 'filter_failed');

        // Delete for privacy
        await supabaseAdmin.from('sms_messages').delete().eq('phone_number', phoneNumber);
        await supabaseAdmin.from('sms_conversations').delete().eq('phone_number', phoneNumber);

        console.log('❌ Filter failed, sent emergency contacts');
      }

    } else if (existingConv.conversation_state === 'awaiting_crisis_level') {
      // CHECK CRISIS LEVEL
      const levelMatch = trimmedBody.match(/^[1-5]$/);
      
      // Store answer
      await supabaseAdmin
        .from('sms_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      if (levelMatch) {
        const crisisLevel = parseInt(levelMatch[0]);
        
        // Update to waiting state
        await supabaseAdmin
          .from('sms_conversations')
          .update({
            conversation_state: 'waiting_for_volunteer',
            crisis_level: crisisLevel,
            last_message: trimmedBody,
            last_message_at: new Date().toISOString(),
            last_auto_message_at: new Date().toISOString(),
            auto_message_count: 1,
            unread_count: existingConv.unread_count + 1
          })
          .eq('phone_number', phoneNumber);

        // Send waiting message
        const waitingMsg = WAITING_MESSAGES[0];
        await sendSms(from, waitingMsg);
        await storeOutboundMessage(phoneNumber, waitingMsg, 'waiting_message');

        // TODO: Notify volunteers (reuse logic from WhatsApp)

        console.log(`✅ Crisis level ${crisisLevel}, now waiting for volunteer`);

      } else {
        // Invalid response
        const retryMsg = `Por favor responde solo con un número del 1 al 5.`;
        await sendSms(from, retryMsg);
        await storeOutboundMessage(phoneNumber, retryMsg, 'crisis_retry');

        console.log('⚠️ Invalid crisis level, asking again');
      }

    } else {
      // NORMAL MESSAGE (waiting_for_volunteer or assigned)
      await supabaseAdmin
        .from('sms_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      await supabaseAdmin
        .from('sms_conversations')
        .update({
          last_message: trimmedBody,
          last_message_at: new Date().toISOString(),
          unread_count: existingConv.unread_count + 1
        })
        .eq('phone_number', phoneNumber);

      console.log('💬 SMS message stored');
    }

    // Return empty TwiML response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } }
    );

  } catch (error) {
    console.error('SMS Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Senda Chat SMS webhook ready' });
}
