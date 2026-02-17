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
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Crisis level messages (shortened to avoid "Read more")
const CRISIS_LEVELS = [
  "1️⃣ Un poco abrumado/a",
  "2️⃣ Necesito apoyo",
  "3️⃣ En crisis, necesito ayuda",
  "4️⃣ En peligro, ayuda ahora",
  "5️⃣ Riesgo vital, ayuda urgente"
];

// Waiting messages (rotate)
const WAITING_MESSAGES = [
  "Gracias por escribirnos. Estamos conectándote con alguien de nuestro equipo. 💙",
  "Tu bienestar es importante para nosotros. En un momento te atendemos.",
  "No estás solo/a. Alguien estará contigo pronto. 🤍",
  "Gracias por tu paciencia. Un voluntario te responderá en breve.",
  "Estamos aquí para ti. Dame un momento mientras te conecto con alguien."
];

// Check if WhatsApp channel is enabled
async function isWhatsAppEnabled(): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'channel_config')
      .single();
    
    // Default to true if no config exists (backwards compatible)
    return data?.value?.whatsapp_enabled ?? true;
  } catch {
    return true; // Default enabled for backwards compatibility
  }
}

// Emergency contacts for failed filter
const EMERGENCY_MESSAGE = `Gracias por comunicarte. 💙

Por el momento todos nuestros voluntarios están ocupados.

Si estás pasando por un momento difícil y necesitas apoyo inmediato, aquí hay recursos que pueden ayudarte:

📞 SAPTEL (24/7): 55 5259 8121
📞 Línea de la Vida: 800-911-2000

Recuerda que no estás solo/a. En estas líneas de apoyo estamos para ti, mereces ser escuchado.`;

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('Twilio credentials not configured');
    return false;
  }

  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

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
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error('Twilio error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

// Store outbound message in database
async function storeOutboundMessage(phoneNumber: string, body: string, status: string = 'sent') {
  await supabaseAdmin
    .from('whatsapp_messages')
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
    // Check if WhatsApp channel is enabled
    const enabled = await isWhatsAppEnabled();
    if (!enabled) {
      console.log('📵 WhatsApp channel is disabled');
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
    const profileName = formData.get('ProfileName') as string;
    
    // Clean phone number
    const phoneNumber = from?.replace('whatsapp:', '') || '';
    const trimmedBody = body?.trim() || '';
    
    console.log('📱 Incoming WhatsApp:', { phoneNumber, profileName, body: trimmedBody.substring(0, 50) });

    // Check for existing conversation
    const { data: existingConv, error: selectError } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    console.log('🔍 Existing conversation:', { exists: !!existingConv, state: existingConv?.conversation_state, error: selectError?.message });

    // Handle based on conversation state
    if (!existingConv) {
      // NEW CONVERSATION - Create and send filter question
      const { error: insertError } = await supabaseAdmin
        .from('whatsapp_conversations')
        .insert({
          phone_number: phoneNumber,
          contact_name: profileName || 'Usuario',
          last_message: trimmedBody,
          last_message_at: new Date().toISOString(),
          conversation_state: 'awaiting_filter',
          unread_count: 1
        });
      
      if (insertError) {
        console.error('❌ Insert error:', insertError);
      }

      // Store their first message
      await supabaseAdmin
        .from('whatsapp_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: profileName || 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      // Send filter question
      const filterQuestion = "Hola, gracias por escribir a Senda Chat. 💙\n\nAntes de conectarte con un voluntario, una pregunta rápida:\n\n¿Cuántos picos tiene un Maguen David?";
      
      await sendWhatsAppMessage(phoneNumber, filterQuestion);
      await storeOutboundMessage(phoneNumber, filterQuestion, 'filter_question');

      console.log('🆕 New conversation, sent filter question');

    } else if (existingConv.conversation_state === 'awaiting_filter') {
      // CHECK FILTER ANSWER
      const answer = trimmedBody.toLowerCase();
      const isCorrect = answer === '6' || answer === 'seis' || answer === 'seis.' || answer === '6.';

      // Store their answer
      await supabaseAdmin
        .from('whatsapp_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: profileName || 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      if (isCorrect) {
        // PASSED - Ask for crisis level
        const { error: updateError } = await supabaseAdmin
          .from('whatsapp_conversations')
          .update({
            conversation_state: 'awaiting_crisis_level',
            filter_passed: true,
            last_message: trimmedBody,
            last_message_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber);
        
        if (updateError) {
          console.error('❌ Update to awaiting_crisis_level failed:', updateError);
        } else {
          console.log('✅ Updated to awaiting_crisis_level');
        }

        const crisisQuestion = `¡Gracias! 💙\n\n¿Cómo te sientes?\n\n${CRISIS_LEVELS.join('\n')}\n\nResponde 1-5:`;
        
        await sendWhatsAppMessage(phoneNumber, crisisQuestion);
        await storeOutboundMessage(phoneNumber, crisisQuestion, 'crisis_question');

        console.log('✅ Filter passed, sent crisis level question');

      } else {
        // FAILED - Send warm message with emergency contacts and close
        await supabaseAdmin
          .from('whatsapp_conversations')
          .update({
            conversation_state: 'closed',
            filter_passed: false,
            last_message: trimmedBody,
            last_message_at: new Date().toISOString(),
            closed_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber);

        await sendWhatsAppMessage(phoneNumber, EMERGENCY_MESSAGE);
        await storeOutboundMessage(phoneNumber, EMERGENCY_MESSAGE, 'filter_failed');

        // Delete conversation immediately for privacy (filter failed = not a community member)
        await supabaseAdmin.from('whatsapp_messages').delete().eq('phone_number', phoneNumber);
        await supabaseAdmin.from('whatsapp_conversations').delete().eq('phone_number', phoneNumber);

        console.log('❌ Filter failed, sent emergency contacts and deleted conversation');
      }

    } else if (existingConv.conversation_state === 'awaiting_crisis_level') {
      // CHECK CRISIS LEVEL
      const levelMatch = trimmedBody.match(/^[1-5]$/);
      
      // Store their answer
      await supabaseAdmin
        .from('whatsapp_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: profileName || 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      if (levelMatch) {
        const crisisLevel = parseInt(levelMatch[0]);
        
        // Update to waiting state
        await supabaseAdmin
          .from('whatsapp_conversations')
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

        // Send first waiting message
        const waitingMsg = WAITING_MESSAGES[0];
        await sendWhatsAppMessage(phoneNumber, waitingMsg);
        await storeOutboundMessage(phoneNumber, waitingMsg, 'waiting_message');

        // Notify volunteers
        const volunteersToNotify = await getVolunteersToNotify();
        console.log(`📢 Found ${volunteersToNotify.length} volunteers to notify:`, 
          volunteersToNotify.map(v => ({ name: v.full_name, phone: v.phone })));
        
        if (volunteersToNotify.length > 0) {
          try {
            await sendNotifications(volunteersToNotify, {
              senderName: profileName || 'Usuario',
              messagePreview: `Nivel de crisis: ${crisisLevel}`,
              phoneNumber,
              crisisLevel
            });
            console.log('✅ Notifications sent successfully');
          } catch (notifyError) {
            console.error('❌ Error sending notifications:', notifyError);
          }
        } else {
          console.log('⚠️ No volunteers to notify!');
        }

        console.log(`✅ Crisis level ${crisisLevel}, now waiting for volunteer`);

      } else {
        // Invalid response, ask again
        const retryMsg = `Por favor responde solo con un número del 1 al 5:\n\n${CRISIS_LEVELS.join('\n\n')}`;
        await sendWhatsAppMessage(phoneNumber, retryMsg);
        await storeOutboundMessage(phoneNumber, retryMsg, 'crisis_retry');

        console.log('⚠️ Invalid crisis level, asking again');
      }

    } else if (existingConv.conversation_state === 'pending_delete') {
      // Handle survey response (existing logic)
      const closedAt = new Date(existingConv.closed_at);
      const now = new Date();
      const secondsSinceClosed = (now.getTime() - closedAt.getTime()) / 1000;
      const isSurveyResponse = /^[1-5]$/.test(trimmedBody);
      
      if (secondsSinceClosed <= 30 && isSurveyResponse) {
        await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            phone_number: phoneNumber,
            sender_name: 'Survey Response',
            message_body: trimmedBody,
            twilio_sid: messageSid,
            direction: 'inbound',
            status: 'survey_response'
          });
        console.log(`📊 Survey response saved: ${trimmedBody}`);
      }
      
      // Delete conversation
      await supabaseAdmin.from('whatsapp_messages').delete()
        .eq('phone_number', phoneNumber).neq('status', 'survey_response');
      await supabaseAdmin.from('whatsapp_conversations').delete().eq('phone_number', phoneNumber);
      
      console.log(`🗑️ Deleted closed conversation`);

    } else {
      // NORMAL MESSAGE (waiting_for_volunteer or assigned)
      // Store message
      await supabaseAdmin
        .from('whatsapp_messages')
        .insert({
          phone_number: phoneNumber,
          sender_name: profileName || 'Usuario',
          message_body: trimmedBody,
          twilio_sid: messageSid,
          direction: 'inbound',
          status: 'received'
        });

      // Update conversation
      await supabaseAdmin
        .from('whatsapp_conversations')
        .update({
          last_message: trimmedBody,
          last_message_at: new Date().toISOString(),
          unread_count: existingConv.unread_count + 1
        })
        .eq('phone_number', phoneNumber);

      // Notify based on conversation state
      if (existingConv.conversation_state === 'waiting_for_volunteer') {
        // Waiting for volunteer - notify all available volunteers
        const volunteersToNotify = await getVolunteersToNotify();
        if (volunteersToNotify.length > 0) {
          await sendNotifications(volunteersToNotify, {
            senderName: profileName || 'Usuario',
            messagePreview: trimmedBody.substring(0, 100),
            phoneNumber,
            crisisLevel: existingConv.crisis_level
          });
        }
      } else if (existingConv.conversation_state === 'assigned' && existingConv.assigned_to) {
        // Assigned conversation - notify only the assigned volunteer
        const { data: assignedVolunteer } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email, phone, push_subscription')
          .eq('id', existingConv.assigned_to)
          .single();
        
        if (assignedVolunteer) {
          await sendNotifications([assignedVolunteer], {
            senderName: profileName || 'Usuario',
            messagePreview: trimmedBody.substring(0, 100),
            phoneNumber,
            crisisLevel: existingConv.crisis_level,
            isAssigned: true
          });
        }
      }

      console.log('💬 Normal message stored');
    }

    // Return empty TwiML response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get volunteers to notify based on duty status
async function getVolunteersToNotify() {
  const { data: onDutyVolunteers } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, phone, push_subscription')
    .eq('is_on_duty', true)
    .eq('status', 'active');

  if (onDutyVolunteers && onDutyVolunteers.length > 0) {
    return onDutyVolunteers;
  }

  const { data: allVolunteers } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, phone, push_subscription')
    .eq('status', 'active');

  return allVolunteers || [];
}

// Send notifications to volunteers (Push + SMS fallback)
async function sendNotifications(
  volunteers: any[],
  messageInfo: { senderName: string; messagePreview: string; phoneNumber: string; crisisLevel?: number; isAssigned?: boolean }
) {
  const crisisEmoji = messageInfo.crisisLevel && messageInfo.crisisLevel >= 4 ? '🚨' : '📱';
  
  // Different title/body for assigned vs new conversations
  let title: string;
  let body: string;
  
  if (messageInfo.isAssigned) {
    // Assigned conversation - show anonymous message preview (protect user privacy)
    title = `💬 Nuevo mensaje`;
    body = 'Tienes un nuevo mensaje en tu conversación asignada';
  } else {
    // New conversation waiting for volunteer
    title = `${crisisEmoji} Nuevo mensaje en Senda Chat`;
    body = messageInfo.crisisLevel 
      ? `Nivel de crisis: ${messageInfo.crisisLevel}. Entra para responder.`
      : 'Tienes un nuevo mensaje. Entra para responder.';
  }
  
  for (const volunteer of volunteers) {
    let notified = false;
    
    // Try push notification first
    if (volunteer.push_subscription) {
      try {
        const webpush = await import('web-push');
        
        webpush.setVapidDetails(
          'mailto:sendachat247@gmail.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BCsw-fS9IvCyazprf7GoljG8ZFD7siunFz_rgfB66EmClp4XEA1Gu4i1KnWZmy7jERvpNUyCL3H26LUCm63U0YU',
          process.env.VAPID_PRIVATE_KEY || 'XRPOBTJ5taiMrkFkgCj0H5S4Q4Wfo3VGajpFEXTbA1w'
        );

        await webpush.sendNotification(
          volunteer.push_subscription,
          JSON.stringify({ title, body, url: '/voluntarios/conversaciones' }),
          { TTL: 3600, urgency: 'high' }
        );
        
        console.log(`✅ Push sent to ${volunteer.full_name}`);
        notified = true;
      } catch (e) {
        console.error(`Push failed for ${volunteer.full_name}:`, e);
      }
    }
    
    // Send WhatsApp notification to volunteer (primary notification method)
    if (volunteer.phone) {
      try {
        const whatsappMsg = messageInfo.isAssigned
          ? `💬 *Nuevo mensaje en tu conversación*\n\nTienes un nuevo mensaje en Senda Chat.\n\n👉 https://senda-chat.vercel.app/voluntarios/conversaciones`
          : `${crisisEmoji} *Nueva conversación en Senda Chat*\n\nNivel de crisis: ${messageInfo.crisisLevel || 'No especificado'}\n\n👉 Entra para responder:\nhttps://senda-chat.vercel.app/voluntarios/conversaciones`;
        
        await sendWhatsAppNotification(volunteer.phone, whatsappMsg);
        console.log(`✅ WhatsApp notification sent to ${volunteer.full_name}`);
        notified = true;
      } catch (e) {
        console.error(`WhatsApp notification failed for ${volunteer.full_name}:`, e);
      }
    }
  }
}

// Send WhatsApp notification to volunteer via Twilio
async function sendWhatsAppNotification(phone: string, message: string) {
  console.log(`📱 Sending WhatsApp notification to ${phone}`);
  
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Twilio credentials not configured!');
    return;
  }

  // Clean phone number and add whatsapp: prefix
  const cleanPhone = phone.replace(/\D/g, '');
  const toWhatsApp = `whatsapp:+${cleanPhone}`;
  console.log(`📱 Formatted number: ${toWhatsApp}`);

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
        Body: message 
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ WhatsApp notification error:', error);
    throw new Error(error);
  }
  
  const result = await response.json();
  console.log('✅ WhatsApp notification sent, SID:', result.sid);
}

export async function GET() {
  return NextResponse.json({ status: 'Senda Chat WhatsApp webhook ready' });
}
