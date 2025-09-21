-- First, create an organization for the existing user
INSERT INTO public.organizations (id, name, slug, owner_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'My Organization',
  'my-organization',
  'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
  now(),
  now()
)
ON CONFLICT (owner_id) DO NOTHING;

-- Then add the user as owner to their organization's team_members
INSERT INTO public.team_members (
  id,
  organization_id,
  user_id,
  role,
  status,
  joined_at,
  invited_at,
  invited_by,
  created_at
)
SELECT 
  gen_random_uuid(),
  o.id,
  'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
  'owner',
  'active',
  now(),
  now(),
  'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
  now()
FROM public.organizations o
WHERE o.owner_id = 'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426'
ON CONFLICT (organization_id, user_id) DO NOTHING;