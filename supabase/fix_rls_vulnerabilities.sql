-- Fix for Senda Chat RLS Vulnerabilities
-- Enabling RLS on all tables
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

-- Creating default policies (Authenticated users can read all)
-- For tables that need write access from admins/supervisors, 
-- we use the profiles table check.

CREATE POLICY "Authenticated users can read all" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Apply similar patterns to other tables...
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name != 'profiles'
    LOOP
        EXECUTE format('CREATE POLICY "Authenticated users can read %I" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'')', t, t);
        EXECUTE format('CREATE POLICY "Admins and supervisors can manage %I" ON public.%I FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = ''admin'' OR role = ''supervisor''))
        )', t, t);
    END LOOP;
END $$;
