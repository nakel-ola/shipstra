-- Create activities table for tracking user actions
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  action_description text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT activities_action_type_check CHECK (action_type IN (
    'login', 'logout', 'signup',
    'project_created', 'project_updated', 'project_deleted',
    'deployment_started', 'deployment_completed', 'deployment_failed',
    'invite_sent', 'invite_accepted', 'invite_cancelled',
    'team_member_added', 'team_member_removed', 'team_member_role_changed',
    'ssh_credential_added', 'ssh_credential_updated', 'ssh_credential_deleted',
    'domain_added', 'domain_verified', 'domain_removed',
    'settings_updated', 'profile_updated'
  ))
);

-- Create indexes for better performance
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_action_type ON public.activities(action_type);
CREATE INDEX idx_activities_entity ON public.activities(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activities"
ON public.activities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities"
ON public.activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;