import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table schemas for reference:
/*
-- Users table (handled by Supabase Auth)
-- No need to create manually

-- User queries table
CREATE TABLE user_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  location_lat DECIMAL,
  location_lon DECIMAL,
  location_name TEXT,
  query_date DATE,
  probabilities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite locations table
CREATE TABLE favorite_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Row Level Security (RLS) policies
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;

-- Policies for user_queries
CREATE POLICY "Users can view own queries" ON user_queries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries" ON user_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for favorite_locations
CREATE POLICY "Users can view own favorites" ON favorite_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorite_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorite_locations
  FOR DELETE USING (auth.uid() = user_id);
*/
