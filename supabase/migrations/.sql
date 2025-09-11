-- This function is updated to assign the 'Citizen' role by default to all new users.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role_id INT;
BEGIN
    -- Find the ID for the 'Citizen' role
    SELECT id INTO default_role_id
    FROM public.roles
    WHERE name = 'Citizen';

    -- Check if role exists
    IF default_role_id IS NULL THEN
        RAISE EXCEPTION 'Default role "Citizen" not found in roles table';
    END IF;

    -- Insert the new user and their default role into the user_roles table
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, default_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Create a corresponding public profile
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to assign default role to user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;