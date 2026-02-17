import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Channel configuration type
type ChannelConfig = {
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
};

// Default config if none exists
const DEFAULT_CONFIG: ChannelConfig = {
  whatsapp_enabled: true,
  sms_enabled: false,
  updated_at: new Date().toISOString(),
  updated_by: null,
};

// GET: Fetch current channel settings
export async function GET(_request: NextRequest) {
  try {
    // First, try to get from app_settings table
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('key', 'channel_config')
      .single();

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist, create it
      if (error.code === '42P01') {
        console.log('app_settings table does not exist, using defaults');
        return NextResponse.json({ config: DEFAULT_CONFIG });
      }
      console.error('Error fetching channel config:', error);
      return NextResponse.json({ config: DEFAULT_CONFIG });
    }

    if (!data) {
      return NextResponse.json({ config: DEFAULT_CONFIG });
    }

    return NextResponse.json({ config: data.value as ChannelConfig });
  } catch (error) {
    console.error('Channel config error:', error);
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}

// POST: Update channel settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsapp_enabled, sms_enabled, user_id } = body;

    const config: ChannelConfig = {
      whatsapp_enabled: whatsapp_enabled ?? true,
      sms_enabled: sms_enabled ?? false,
      updated_at: new Date().toISOString(),
      updated_by: user_id || null,
    };

    // Try to upsert into app_settings
    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        key: 'channel_config',
        value: config,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) {
      // If table doesn't exist, return success with flag
      if (error.code === '42P01') {
        console.log('app_settings table needs to be created - run migration 006_sms_channels.sql');
        return NextResponse.json({ success: true, config, needsTable: true });
      }
      
      console.error('Error saving channel config:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Channel update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
