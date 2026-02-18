-- Add day and hour columns for charts
ALTER TABLE conversation_stats 
ADD COLUMN IF NOT EXISTS conversation_date DATE,
ADD COLUMN IF NOT EXISTS conversation_hour INTEGER;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversation_stats_date ON conversation_stats(conversation_date);
CREATE INDEX IF NOT EXISTS idx_conversation_stats_hour ON conversation_stats(conversation_hour);
