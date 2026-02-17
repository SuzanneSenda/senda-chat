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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentMessages } = await supabase
      .from('whatsapp_messages')
      .select('created_at, phone_number')
      .eq('direction', 'inbound')
      .gte('created_at', sevenDaysAgo.toISOString()) as { data: { created_at: string; phone_number: string }[] | null };

    // Group unique phones by day
    const convsByDay: { [key: string]: Set<string> } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      convsByDay[key] = new Set();
    }

    if (recentMessages) {
      for (const msg of recentMessages) {
        const day = msg.created_at.split('T')[0];
        if (convsByDay[day]) {
          convsByDay[day].add(msg.phone_number);
        }
      }
    }

    const dailyStats = Object.entries(convsByDay).map(([date, phones]) => ({
      date,
      label: new Date(date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
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

    // Get volunteer stats (conversations and ratings per volunteer)
    let volunteerMsgsQuery = supabase
      .from('whatsapp_messages')
      .select('volunteer_id, phone_number')
      .eq('direction', 'outbound')
      .not('volunteer_id', 'is', null);
    
    if (dateFilter) {
      volunteerMsgsQuery = volunteerMsgsQuery.gte('created_at', dateFilter);
    }
    
    const { data: volunteerMsgs } = await volunteerMsgsQuery as { data: { volunteer_id: string; phone_number: string }[] | null };

    // Get volunteer profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['voluntario', 'admin', 'supervisor']) as { data: { id: string; full_name: string }[] | null };

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    // Count conversations per volunteer
    const volunteerConvs: { [key: string]: Set<string> } = {};
    if (volunteerMsgs) {
      for (const msg of volunteerMsgs) {
        if (!volunteerConvs[msg.volunteer_id]) {
          volunteerConvs[msg.volunteer_id] = new Set();
        }
        volunteerConvs[msg.volunteer_id].add(msg.phone_number);
      }
    }

    const volunteerStats = Object.entries(volunteerConvs).map(([id, phones]) => ({
      id,
      name: profileMap.get(id) || 'Desconocido',
      conversations: phones.size
    })).sort((a, b) => b.conversations - a.conversations);

    // Calculate ratings per volunteer
    // Find which volunteer last messaged each phone that gave a rating
    const volunteerRatings: { [volunteerId: string]: number[] } = {};
    
    if (volunteerMsgs && Object.keys(ratingsByPhone).length > 0) {
      // Group outbound messages by phone to find last volunteer
      const lastVolunteerByPhone: { [phone: string]: string } = {};
      for (const msg of volunteerMsgs) {
        // Since we don't have timestamp in this query, we'll use any volunteer who messaged
        lastVolunteerByPhone[msg.phone_number] = msg.volunteer_id;
      }
      
      // Associate ratings with volunteers
      for (const [phone, rating] of Object.entries(ratingsByPhone)) {
        const volunteerId = lastVolunteerByPhone[phone];
        if (volunteerId) {
          if (!volunteerRatings[volunteerId]) {
            volunteerRatings[volunteerId] = [];
          }
          volunteerRatings[volunteerId].push(rating);
        }
      }
    }

    // Build volunteer ratings stats
    const volunteerRatingStats = Object.entries(volunteerRatings).map(([id, ratings]) => ({
      id,
      name: profileMap.get(id) || 'Desconocido',
      avgRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
      totalRatings: ratings.length
    })).sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));

    // Calculate average conversation duration (time from first to last message per phone)
    let allMsgsQuery = supabase
      .from('whatsapp_messages')
      .select('phone_number, created_at')
      .order('created_at', { ascending: true });
    
    if (dateFilter) {
      allMsgsQuery = allMsgsQuery.gte('created_at', dateFilter);
    }
    
    const { data: allMsgs } = await allMsgsQuery as { data: { phone_number: string; created_at: string }[] | null };
    
    const convDurations: number[] = [];
    if (allMsgs) {
      const byPhone: { [key: string]: string[] } = {};
      for (const msg of allMsgs) {
        if (!byPhone[msg.phone_number]) byPhone[msg.phone_number] = [];
        byPhone[msg.phone_number].push(msg.created_at);
      }
      
      for (const times of Object.values(byPhone)) {
        if (times.length >= 2) {
          const first = new Date(times[0]).getTime();
          const last = new Date(times[times.length - 1]).getTime();
          const durationMin = (last - first) / (1000 * 60);
          if (durationMin > 0) convDurations.push(durationMin);
        }
      }
    }
    
    const avgDurationMin = convDurations.length > 0 
      ? Math.round(convDurations.reduce((a, b) => a + b, 0) / convDurations.length)
      : null;

    return NextResponse.json({
      totalConversations,
      closedConversations,
      surveyResponses,
      averageScore,
      scoreDistribution,
      dailyStats,
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
