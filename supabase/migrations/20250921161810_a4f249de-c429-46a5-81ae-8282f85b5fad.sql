-- Create team invites table
CREATE TABLE public.team_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT team_invites_role_check CHECK (role IN ('admin', 'member')),
  CONSTRAINT team_invites_status_check CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  CONSTRAINT team_invites_unique_email_org UNIQUE (organization_id, email)
);

-- Enable RLS
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team invites
CREATE POLICY "Users can view invites for their organizations" 
ON public.team_invites 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.organization_id = team_invites.organization_id 
    AND tm.user_id = auth.uid() 
    AND tm.status = 'active'
  )
);

CREATE POLICY "Organization admins can manage invites" 
ON public.team_invites 
FOR ALL 
USING (is_organization_admin(auth.uid(), organization_id))
WITH CHECK (is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Users can accept invites sent to their email"
ON public.team_invites
FOR UPDATE
USING (
  auth.jwt() ->> 'email' = email 
  AND status = 'pending' 
  AND expires_at > now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_team_invites_updated_at
  BEFORE UPDATE ON public.team_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();