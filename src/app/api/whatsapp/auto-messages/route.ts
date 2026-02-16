import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint should be called by a cron job every 60 seconds
// Vercel Cron or external service
// Each conversation gets ONE message per run, with 90 second minimum between messages

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Waiting messages (rotate through these)
const WAITING_MESSAGES = [
  "Gracias por escribirnos. Estamos conectándote con alguien de nuestro equipo. 💙",
  "Tu bienestar es importante para nosotros. En un momento te atendemos.",
  "No estás solo/a. Alguien estará contigo pronto. 🤍",
  "Gracias por tu paciencia. Un voluntario te responderá en breve.",
  "Estamos aquí para ti. Dame un momento mientras te conecto con alguien."
];

// Maximum auto-messages per conversation (stop after this many)
const MAX_AUTO_MESSAGES = 5;

// Cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return false;

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
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations waiting for volunteer that haven't received auto-message in 90+ seconds
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000).toISOString();

    const { data: waitingConversations, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select('*')
      .eq('conversation_state', 'waiting_for_volunteer')
      .or(`last_auto_message_at.is.null,last_auto_message_at.lt.${ninetySecondsAgo}`);

    if (error) {
      console.error('Error fetching waiting conversations:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!waitingConversations || waitingConversations.length === 0) {
      return NextResponse.json({ message: 'No conversations need auto-message', count: 0 });
    }

    let sentCount = 0;

    for (const conv of waitingConversations) {
      // Skip if already at max messages
      const currentCount = conv.auto_message_count || 0;
      if (currentCount >= MAX_AUTO_MESSAGES) {
        console.log(`⏭️ Skipping ${conv.phone_number} - already sent ${currentCount} auto-messages`);
        continue;
      }

      // Get next message in rotation (0-4)
      const messageIndex = currentCount % WAITING_MESSAGES.length;
      const message = WAITING_MESSAGES[messageIndex];

      // Send message
      const sent = await sendWhatsAppMessage(conv.phone_number, message);

      if (sent) {
        // Update conversation
        await supabaseAdmin
          .from('whatsapp_conversations')
          .update({
            last_auto_message_at: new Date().toISOString(),
            auto_message_count: (conv.auto_message_count || 0) + 1
          })
          .eq('phone_number', conv.phone_number);

        // Store outbound message
        await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            phone_number: conv.phone_number,
            sender_name: 'Senda Chat',
            message_body: message,
            direction: 'outbound',
            status: 'waiting_message'
          });

        sentCount++;
        console.log(`📤 Auto-message #${messageIndex + 1} sent to ${conv.phone_number}`);
      }
    }

    return NextResponse.json({ 
      message: 'Auto-messages processed', 
      count: sentCount,
      total: waitingConversations.length 
    });

  } catch (error) {
    console.error('Auto-message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  // Verify cron secret for GET too
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ status: 'Auto-messages endpoint ready. Auth required to trigger.' });
  }
  
  // If authorized, run the same logic as POST
  return POST(request);
}
