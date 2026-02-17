import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get period filter
    const period = request.nextUrl.searchParams.get('period') || 'all';
    
    let dateFilter: string | null = null;
    const now = new Date();
    
    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo.toISOString();
    } else if (period === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = monthAgo.toISOString();
    }

    // Get total conversations (unique phone numbers)
    let conversationsQuery = supabase
      .from('whatsapp_messages')
      .select('phone_number')
      .eq('direction', 'inbound');
    
    if (dateFilter) {
      conversationsQuery = conversationsQuery.gte('created_at', dateFilter);
    }
    
    const { data: conversations } = await conversationsQuery as { data: { phone_number: string }[] | null };

    const uniqueConversations = new Set(conversations?.map(c => c.phone_number) || []);
    const totalConversations = uniqueConversations.size;

    // Get closed conversations (conversations that received the survey)
    let closedQuery = supabase
      .from('whatsapp_messages')
      .select('phone_number')
      .eq('direction', 'outbound')
      .ilike('message_body', '%escala del 1 al 5%');
    
    if (dateFilter) {
      closedQuery = closedQuery.gte('created_at', dateFilter);
    }
    
    const { data: closedConvs } = await closedQuery as { data: { phone_number: string }[] | null };

    const closedConversations = new Set(closedConvs?.map(c => c.phone_number) || []).size;

    // Get survey responses (messages that are just a number 1-5)
    let inboundQuery = supabase
      .from('whatsapp_messages')
      .select('phone_number, message_body, created_at')
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false });
    
    if (dateFilter) {
      inboundQuery = inboundQuery.gte('created_at', dateFilter);
    }
    
    const { data: allInbound } = await inboundQuery as { data: { phone_number: string; message_body: string; created_at: string }[] | null };

    // Count responses that are survey answers (1-5) and track by phone
    let surveyResponses = 0;
    const surveyScores: number[] = [];
    const ratingsByPhone: { [phone: string]: number } = {};
    
    if (allInbound) {
      for (const msg of allInbound) {
        const trimmed = msg.message_body?.trim();
        if (/^[1-5]$/.test(trimmed)) {
          surveyResponses++;
          const score = parseInt(trimmed);
          surveyScores.push(score);
          // Only keep first (most recent) rating per phone
          if (!ratingsByPhone[msg.phone_number]) {
            ratingsByPhone[msg.phone_number] = score;
          }
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

    // Get conversations per day (last 7 days) - count unique phone numbers
    // Use Mexico City timezone for date calculations
    const getMexicoDate = (date: Date) => {
      return new Date(date.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    };
    
    const formatMexicoDate = (date: Date) => {
      const mx = getMexicoDate(date);
      return `${mx.getFullYear()}-${String(mx.getMonth() + 1).padStart(2, '0')}-${String(mx.getDate()).padStart(2, '0')}`;
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMessages } = await supabase
      .from('whatsapp_messages')
      .select('created_at, phone_number')
      .eq('direction', 'inbound')
      .gte('created_at', sevenDaysAgo.toISOString()) as { data: { created_at: string; phone_number: string }[] | null };

    // Group unique phones by day (Mexico timezone)
    const convsByDay: { [key: string]: Set<string> } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = formatMexicoDate(date);
      convsByDay[key] = new Set();
    }

    if (recentMessages) {
      for (const msg of recentMessages) {
        // Convert message timestamp to Mexico timezone date
        const msgDate = new Date(msg.created_at);
        const day = formatMexicoDate(msgDate);
        if (convsByDay[day]) {
          convsByDay[day].add(msg.phone_number);
        }
      }
    }

    const dailyStats = Object.entries(convsByDay).map(([date, phones]) => ({
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', timeZone: 'America/Mexico_City' }),
      conversations: phones.size
    }));

    // Get conversations by hour of day
    let allInboundMsgs = supabase
      .from('whatsapp_messages')
      .select('created_at, phone_number')
      .eq('direction', 'inbound');
    
    if (dateFilter) {
      allInboundMsgs = allInboundMsgs.gte('created_at', dateFilter);
    }
    
    const { data: hourlyMsgs } = await allInboundMsgs as { data: { created_at: string; phone_number: string }[] | null };
    
    // Count unique conversations per hour
    const hourlyConvs: { [hour: number]: Set<string> } = {};
    for (let h = 0; h < 24; h++) {
      hourlyConvs[h] = new Set();
    }
    
    if (hourlyMsgs) {
      for (const msg of hourlyMsgs) {
        // Convert to Mexico timezone hour
        const msgDate = new Date(msg.created_at);
        const mexicoHour = parseInt(msgDate.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Mexico_City' }));
        hourlyConvs[mexicoHour].add(msg.phone_number);
      }
    }
    
    const hourlyStats = Object.entries(hourlyConvs).map(([hour, phones]) => ({
      hour: parseInt(hour),
      label: `${hour}:00`,
      conversations: phones.size
    }));

    // Get oldest message date for "desde" display
    let oldestQuery = supabase
      .from('whatsapp_messages')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (dateFilter) {
      oldestQuery = oldestQuery.gte('created_at', dateFilter);
    }
    
    const { data: oldestMsg } = await oldestQuery as { data: { created_at: string }[] | null };
    const dataStartDate = oldestMsg?.[0]?.created_at || null;

    // Get volunteer stats from conversation_stats table
    let statsQuery = supabase
      .from('conversation_stats')
      .select('*');
    
    if (dateFilter) {
      statsQuery = statsQuery.gte('closed_at', dateFilter);
    }
    
    const { data: convStats } = await statsQuery as { data: { 
      volunteer_id: string | null; 
      volunteer_name: string | null;
      crisis_level: number | null;
      rating: number | null;
      duration_minutes: number | null;
      closed_at: string;
    }[] | null };

    // Count conversations per volunteer
    const volunteerConvCounts: { [key: string]: { name: string; count: number } } = {};
    const volunteerRatingsFromStats: { [key: string]: number[] } = {};
    const durations: number[] = [];
    
    if (convStats) {
      for (const stat of convStats) {
        // Track duration
        if (stat.duration_minutes !== null && stat.duration_minutes > 0) {
          durations.push(stat.duration_minutes);
        }
        
        // Track volunteer conversations
        if (stat.volunteer_id) {
          if (!volunteerConvCounts[stat.volunteer_id]) {
            volunteerConvCounts[stat.volunteer_id] = {
              name: stat.volunteer_name || 'Desconocido',
              count: 0
            };
          }
          volunteerConvCounts[stat.volunteer_id].count++;
          
          // Track volunteer ratings
          if (stat.rating !== null) {
            if (!volunteerRatingsFromStats[stat.volunteer_id]) {
              volunteerRatingsFromStats[stat.volunteer_id] = [];
            }
            volunteerRatingsFromStats[stat.volunteer_id].push(stat.rating);
          }
        }
      }
    }

    const volunteerStats = Object.entries(volunteerConvCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        conversations: data.count
      }))
      .sort((a, b) => b.conversations - a.conversations);

    // Build volunteer ratings stats
    const volunteerRatingStats = Object.entries(volunteerRatingsFromStats)
      .map(([id, ratings]) => ({
        id,
        name: volunteerConvCounts[id]?.name || 'Desconocido',
        avgRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
        totalRatings: ratings.length
      }))
      .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));

    // Calculate average duration from stats table
    const avgDurationMin = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    return NextResponse.json({
      totalConversations,
      closedConversations,
      surveyResponses,
      averageScore,
      scoreDistribution,
      dailyStats,
      hourlyStats,
      dataStartDate,
      volunteerStats,
      volunteerRatingStats,
      avgDurationMin,
      periodLabel: period === 'week' ? 'Esta semana' : period === 'month' ? 'Este mes' : 'Todo el tiempo',
      responseRate: closedConversations > 0 
        ? ((surveyResponses / closedConversations) * 100).toFixed(0) 
        : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
