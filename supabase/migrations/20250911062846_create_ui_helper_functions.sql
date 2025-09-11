-- Function to get the current user's highest role.
-- This makes it easy for the frontend to know which UI to display.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT name INTO user_role
    FROM public.roles r
    JOIN public.user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    -- Assuming one role per user for simplicity, or ordering by a priority column.
    LIMIT 1;
    
    RETURN user_role;
END;
$$;

-- Function for citizens to view only verified public observations on their map.
CREATE OR REPLACE FUNCTION public.get_verified_observations()
RETURNS SETOF public.observations
LANGUAGE sql
AS $$
    SELECT *
    FROM public.observations
    WHERE status = 'verified';
$$;