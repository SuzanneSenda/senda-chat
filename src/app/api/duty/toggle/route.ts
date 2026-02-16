import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { isOnDuty } = await request.json();

    // Update the user's duty status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_on_duty: isOnDuty })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating duty status:', updateError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    // Log the duty change
    console.log(`👤 ${user.email} ${isOnDuty ? 'entered' : 'left'} duty at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      isOnDuty,
      message: isOnDuty ? 'Ahora estás de guardia' : 'Saliste de guardia'
    });
  } catch (error) {
    console.error('Error in duty toggle:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
