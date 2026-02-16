-- App Settings table for storing configuration like channel status
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default channel config
INSERT INTO app_settings (key, value)
VALUES (
  'channel_config',
  '{
    "whatsapp_enabled": true,
    "sms_enabled": false,
    "updated_at": null,
    "updated_by": null
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- SMS Conversations table (mirrors whatsapp_conversations)
CREATE TABLE IF NOT EXISTS sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  conversation_state TEXT DEFAULT 'new',
  filter_passed BOOLEAN,
  crisis_level INTEGER,
  assigned_to UUID REFERENCES profiles(id),
  unread_count INTEGER DEFAULT 0,
  last_auto_message_at TIMESTAMPTZ,
  auto_message_count INTEGER DEFAULT 0,
  closed_at TIMESTAMPTZ,
  channel TEXT DEFAULT 'sms',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS Messages table (mirrors whatsapp_messages)
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  sender_name TEXT,
  message_body TEXT NOT NULL,
  twilio_sid TEXT,
  direction TEXT NOT NULL DEFAULT 'inbound',
  status TEXT DEFAULT 'received',
  volunteer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone ON sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_state ON sms_conversations(conversation_state);
CREATE INDEX IF NOT EXISTS idx_sms_messages_phone ON sms_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created ON sms_messages(created_at);

-- Comment
COMMENT ON TABLE app_settings IS 'Application configuration settings';
COMMENT ON TABLE sms_conversations IS 'SMS conversations (mirrors whatsapp_conversations)';
COMMENT ON TABLE sms_messages IS 'SMS messages (mirrors whatsapp_messages)';
