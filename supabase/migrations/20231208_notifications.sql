-- Create notifications table
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE notification_category AS ENUM ('message', 'maintenance', 'finance', 'compliance', 'system');

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'info',
  category notification_category NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Service/System can insert notifications (and users can insert for themselves if needed, e.g. test)
-- For a secure system, inserts should be unrestricted if triggered by backend, 
-- but since we are using Supabase client side, we might need a policy for insert if users trigger it.
-- We'll allow authenticated users to insert for themselves (e.g. self-actions)
CREATE POLICY "Users can insert their own notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
