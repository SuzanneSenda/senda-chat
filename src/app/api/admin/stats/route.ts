import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get total conversations (unique phone numbers)
    const { data: conversations } = await supabase
      .from('whatsapp_messages')
      .select('phone_number')
      .eq('direction', 'inbound') as { data: { phone_number: string }[] | null };

    const uniqueConversations = new Set(conversations?.map(c => c.phone_number) || []);
    const totalConversations = uniqueConversations.size;

    // Get closed conversations (conversations that received the survey)
    const { data: closedConvs } = await supabase
      .from('whatsapp_messages')
      .select('phone_number')
      .eq('direction', 'outbound')
      .ilike('message_body', '%escala del 1 al 5%') as { data: { phone_number: string }[] | null };

    const closedConversations = new Set(closedConvs?.map(c => c.phone_number) || []).size;

    // Get survey responses (messages that are just a number 1-5)
    const { data: allInbound } = await supabase
      .from('whatsapp_messages')
      .select('phone_number, message_body, created_at')
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false }) as { data: { phone_number: string; message_body: string; created_at: string }[] | null };

    // Count responses that are survey answers (1-5)
    let surveyResponses = 0;
    const surveyScores: number[] = [];
    
    if (allInbound) {
      for (const msg of allInbound) {
        const trimmed = msg.message_body?.trim();
        if (/^[1-5]$/.test(trimmed)) {
          surveyResponses++;
          surveyScores.push(parseInt(trimmed));
        }
      }
    }

    // Calculate average score
    const averageScore = surveyScores.length > 0 
      ? (surveyScores.reduce((a, b) => a + b, 0) / surveyScores.length).toFixed(1)
      : null;

    // Score distribution
    const scoreDistribution = [1, 2, 3, 4, 5].map(score => ({
      score,
      count: surveyScores.filter(s => s === score).length
    }));

    // Get messages per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMessages } = await supabase
      .from('whatsapp_messages')
      .select('created_at, direction')
      .gte('created_at', sevenDaysAgo.toISOString()) as { data: { created_at: string; direction: string }[] | null };

    // Group by day
    const messagesByDay: { [key: string]: { inbound: number; outbound: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      messagesByDay[key] = { inbound: 0, outbound: 0 };
    }

    if (recentMessages) {
      for (const msg of recentMessages) {
        const day = msg.created_at.split('T')[0];
        if (messagesByDay[day]) {
          if (msg.direction === 'inbound') {
            messagesByDay[day].inbound++;
          } else {
            messagesByDay[day].outbound++;
          }
        }
      }
    }

    const dailyStats = Object.entries(messagesByDay).map(([date, counts]) => ({
      date,
      label: new Date(date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
      ...counts
    }));

    return NextResponse.json({
      totalConversations,
      closedConversations,
      surveyResponses,
      averageScore,
      scoreDistribution,
      dailyStats,
      responseRate: closedConversations > 0 
        ? ((surveyResponses / closedConversations) * 100).toFixed(0) 
        : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
