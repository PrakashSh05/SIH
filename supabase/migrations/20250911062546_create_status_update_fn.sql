-- This function allows a user to update the status of an observation.
-- It checks if the user has the 'Official' or 'Administrator' role before proceeding.
CREATE OR REPLACE FUNCTION public.update_observation_status(
    observation_id_to_update UUID,
    new_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the permissions of the function owner
AS $$
BEGIN
    -- First, check if the current user is an Official or Administrator
    IF NOT (check_user_role('Official') OR check_user_role('Administrator')) THEN
        RAISE EXCEPTION 'Insufficient permissions: User must be an Official or Administrator.';
    END IF;

    -- Check if the new status is valid
    IF NOT new_status IN ('pending', 'verified', 'rejected') THEN
        RAISE EXCEPTION 'Invalid status. Must be one of: pending, verified, rejected.';
    END IF;

    -- If checks pass, perform the update
    UPDATE public.observations
    SET status = new_status
    WHERE id = observation_id_to_update;
END;
$$;