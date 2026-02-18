-- Migration: Enable RLS on all tables
-- Date: 2026-02-18
-- Purpose: Fix security vulnerabilities flagged by Supabase Security Advisor

-- ============================================
-- STEP 1: Enable RLS on all tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toolbox_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toolbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Profiles table policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- STEP 3: App settings (read: all auth, write: admin)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can manage app_settings" ON public.app_settings;

CREATE POLICY "Authenticated users can read app_settings" ON public.app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage app_settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- STEP 4: Content tables (read/write: authenticated)
-- ============================================
-- Messages
DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON public.messages;

CREATE POLICY "Authenticated users can read messages" ON public.messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage messages" ON public.messages
  FOR ALL USING (auth.role() = 'authenticated');

-- Message tags
DROP POLICY IF EXISTS "Authenticated users can read message_tags" ON public.message_tags;
DROP POLICY IF EXISTS "Authenticated users can manage message_tags" ON public.message_tags;

CREATE POLICY "Authenticated users can read message_tags" ON public.message_tags
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage message_tags" ON public.message_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Message tag relations
DROP POLICY IF EXISTS "Authenticated users can read message_tag_relations" ON public.message_tag_relations;
DROP POLICY IF EXISTS "Authenticated users can manage message_tag_relations" ON public.message_tag_relations;

CREATE POLICY "Authenticated users can read message_tag_relations" ON public.message_tag_relations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage message_tag_relations" ON public.message_tag_relations
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 5: Toolbox (read/write: authenticated)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read toolbox_sections" ON public.toolbox_sections;
DROP POLICY IF EXISTS "Authenticated users can manage toolbox_sections" ON public.toolbox_sections;

CREATE POLICY "Authenticated users can read toolbox_sections" ON public.toolbox_sections
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage toolbox_sections" ON public.toolbox_sections
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read toolbox_items" ON public.toolbox_items;
DROP POLICY IF EXISTS "Authenticated users can manage toolbox_items" ON public.toolbox_items;

CREATE POLICY "Authenticated users can read toolbox_items" ON public.toolbox_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage toolbox_items" ON public.toolbox_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 6: Resources (read/write: authenticated)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read resource_categories" ON public.resource_categories;
DROP POLICY IF EXISTS "Authenticated users can manage resource_categories" ON public.resource_categories;

CREATE POLICY "Authenticated users can read resource_categories" ON public.resource_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage resource_categories" ON public.resource_categories
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can manage resources" ON public.resources;

CREATE POLICY "Authenticated users can read resources" ON public.resources
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage resources" ON public.resources
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 7: WhatsApp tables (read: authenticated, write: service_role only)
-- Note: Webhooks use service_role which bypasses RLS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read whatsapp_messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users can read whatsapp_conversations" ON public.whatsapp_conversations;

CREATE POLICY "Authenticated users can read whatsapp_messages" ON public.whatsapp_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read whatsapp_conversations" ON public.whatsapp_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 8: SMS tables (read: authenticated, write: service_role only)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read sms_messages" ON public.sms_messages;
DROP POLICY IF EXISTS "Authenticated users can read sms_conversations" ON public.sms_conversations;

CREATE POLICY "Authenticated users can read sms_messages" ON public.sms_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read sms_conversations" ON public.sms_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 9: Conversation stats (read: authenticated)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read conversation_stats" ON public.conversation_stats;

CREATE POLICY "Authenticated users can read conversation_stats" ON public.conversation_stats
  FOR SELECT USING (auth.role() = 'authenticated');
