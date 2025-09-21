-- Drop existing problematic policies
DROP POLICY IF EXISTS "Organization owners and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view team members in their organizations" ON public.team_members;

-- Create a security definer function to check if user is team member/admin without RLS recursion
CREATE OR REPLACE FUNCTION public.is_team_member_or_admin(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.user_id = _user_id 
      AND tm.organization_id = _organization_id
      AND tm.status = 'active'
  )
$$;

-- Create a security definer function to check if user is organization owner/admin
CREATE OR REPLACE FUNCTION public.is_organization_admin(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.user_id = _user_id 
      AND tm.organization_id = _organization_id
      AND tm.role IN ('owner', 'admin')
      AND tm.status = 'active'
  ) OR EXISTS (
    SELECT 1 
    FROM public.organizations o
    WHERE o.id = _organization_id 
      AND o.owner_id = _user_id
  )
$$;

-- Create new non-recursive policies for team_members
CREATE POLICY "Users can view team members in organizations they belong to"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.is_team_member_or_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Organization admins can manage team members"
  ON public.team_members
  FOR ALL
  TO authenticated
  USING (
    public.is_organization_admin(auth.uid(), organization_id)
  )
  WITH CHECK (
    public.is_organization_admin(auth.uid(), organization_id)
  );

-- Policy for users to accept invitations (insert themselves)
CREATE POLICY "Users can accept team invitations"
  ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);