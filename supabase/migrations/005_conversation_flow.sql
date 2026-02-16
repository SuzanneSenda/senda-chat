-- Migration: Conversation Flow (Entry Filter + Crisis Level + Assignment)
-- Run this in Supabase SQL Editor

-- Add conversation state and assignment fields
ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS conversation_state TEXT DEFAULT 'new' 
  CHECK (conversation_state IN ('new', 'awaiting_filter', 'awaiting_crisis_level', 'waiting_for_volunteer', 'assigned', 'closed', 'pending_delete'));

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS crisis_level INTEGER CHECK (crisis_level >= 1 AND crisis_level <= 5);

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS last_auto_message_at TIMESTAMPTZ;

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS auto_message_count INTEGER DEFAULT 0;

ALTER TABLE whatsapp_conversations 
ADD COLUMN IF NOT EXISTS filter_passed BOOLEAN DEFAULT FALSE;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_state ON whatsapp_conversations(conversation_state);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON whatsapp_conversations(assigned_to);

-- Update existing conversations to 'waiting_for_volunteer' state (they already passed filter implicitly)
UPDATE whatsapp_conversations 
SET conversation_state = 'waiting_for_volunteer', filter_passed = TRUE
WHERE conversation_state = 'new' OR conversation_state IS NULL;
