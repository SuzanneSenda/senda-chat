-- Migration: Add status column to profiles
-- Run this in Supabase SQL Editor

-- Create user status enum if not exists
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'pending';

-- Add last_sign_in column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE;

-- Update existing users to 'active' status (they're already approved)
UPDATE profiles SET status = 'active' WHERE status = 'pending';

-- Specifically ensure Suzanne is active and supervisor
UPDATE profiles 
SET status = 'active', role = 'supervisor' 
WHERE email = 'smitrani@gmail.com';

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);
