-- Create an organization for the existing user
DO $$
DECLARE 
    org_id uuid;
BEGIN
    -- Insert organization if it doesn't exist
    INSERT INTO public.organizations (name, slug, owner_id, created_at, updated_at)
    VALUES ('My Organization', 'my-organization', 'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426', now(), now())
    RETURNING id INTO org_id;
    
    -- Add the user as owner to their organization's team_members
    INSERT INTO public.team_members (
        organization_id,
        user_id,
        role,
        status,
        joined_at,
        invited_at,
        invited_by,
        created_at
    )
    VALUES (
        org_id,
        'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
        'owner',
        'active',
        now(),
        now(),
        'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
        now()
    );
EXCEPTION
    WHEN OTHERS THEN
        -- If organization already exists, try to find it and add team member
        SELECT id INTO org_id FROM public.organizations WHERE owner_id = 'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426' LIMIT 1;
        
        IF org_id IS NOT NULL THEN
            INSERT INTO public.team_members (
                organization_id,
                user_id,
                role,
                status,
                joined_at,
                invited_at,
                invited_by,
                created_at
            )
            VALUES (
                org_id,
                'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
                'owner',
                'active',
                now(),
                now(),
                'f99a9d2d-cfa7-4c3b-8c60-9f94c4ab3426',
                now()
            )
            ON CONFLICT (organization_id, user_id) DO NOTHING;
        END IF;
END $$;