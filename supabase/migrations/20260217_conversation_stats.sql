-- Create conversation_stats table to preserve stats after conversation deletion
CREATE TABLE IF NOT EXISTS conversation_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID REFERENCES profiles(id),
  volunteer_name TEXT,
  crisis_level INTEGER CHECK (crisis_level >= 1 AND crisis_level <= 5),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  duration_minutes INTEGER,
  closed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversation_stats_volunteer ON conversation_stats(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_stats_closed_at ON conversation_stats(closed_at);

-- Enable RLS
ALTER TABLE conversation_stats ENABLE ROW LEVEL SECURITY;

-- Policy: admins and supervisors can read all stats
CREATE POLICY "Admin and supervisor can read stats" ON conversation_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Policy: volunteers can read their own stats
CREATE POLICY "Volunteers can read own stats" ON conversation_stats
  FOR SELECT
  USING (volunteer_id = auth.uid());

-- Policy: service role can insert (for API)
CREATE POLICY "Service role can insert stats" ON conversation_stats
  FOR INSERT
  WITH CHECK (true);
