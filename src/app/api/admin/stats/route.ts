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

    // Get total conversations from conversation_stats (closed conversations)
    let totalConversationsQuery = supabase
      .from('conversation_stats')
      .select('id', { count: 'exact' });
    
    if (dateFilter) {
      totalConversationsQuery = totalConversationsQuery.gte('closed_at', dateFilter);
    }
    
    const { count: totalConversations } = await totalConversationsQuery;

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

    // Get conversations per day (last 7 days) - from conversation_stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: dailyData } = await supabase
      .from('conversation_stats')
      .select('conversation_date')
      .gte('conversation_date', sevenDaysAgoStr) as { data: { conversation_date: string }[] | null };

    // Initialize last 7 days
    const convsByDay: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      convsByDay[key] = 0;
    }

    if (dailyData) {
      for (const row of dailyData) {
        if (row.conversation_date && convsByDay[row.conversation_date] !== undefined) {
          convsByDay[row.conversation_date]++;
        }
      }
    }

    const dailyStats = Object.entries(convsByDay).map(([date, count]) => ({
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', timeZone: 'America/Mexico_City' }),
      conversations: count
    }));

    // Get conversations by hour of day - from conversation_stats
    let hourlyQuery = supabase
      .from('conversation_stats')
      .select('conversation_hour');
    
    if (dateFilter) {
      hourlyQuery = hourlyQuery.gte('closed_at', dateFilter);
    }
    
    const { data: hourlyData } = await hourlyQuery as { data: { conversation_hour: number }[] | null };
    
    // Count conversations per hour
    const hourlyConvs: { [hour: number]: number } = {};
    for (let h = 0; h < 24; h++) {
      hourlyConvs[h] = 0;
    }
    
    if (hourlyData) {
      for (const row of hourlyData) {
        if (row.conversation_hour !== null && row.conversation_hour >= 0 && row.conversation_hour < 24) {
          hourlyConvs[row.conversation_hour]++;
        }
      }
    }
    
    const hourlyStats = Object.entries(hourlyConvs).map(([hour, count]) => ({
      hour: parseInt(hour),
      label: `${hour}:00`,
      conversations: count
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
