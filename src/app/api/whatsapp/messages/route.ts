import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ messages: [] });
    }

    // Mark inbound messages as read
    await supabase
      .from('whatsapp_messages')
      .update({ status: 'read' })
      .eq('phone_number', phone)
      .eq('direction', 'inbound')
      .eq('status', 'received');

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error in messages:', error);
    return NextResponse.json({ messages: [] });
  }
}
