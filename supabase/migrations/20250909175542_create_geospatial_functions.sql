-- Basic user statistics function (no geospatial dependencies)
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id_to_check UUID;
    result JSON;
BEGIN
    user_id_to_check := COALESCE(target_user_id, auth.uid());
    
    IF user_id_to_check != auth.uid() AND NOT public.check_user_role('Administrator') THEN
        RAISE EXCEPTION 'Insufficient permissions to view user statistics';
    END IF;
    
    SELECT json_build_object(
        'user_id', user_id_to_check,
        'projects_created', (SELECT COUNT(*) FROM public.projects WHERE owner_id = user_id_to_check),
        'observations_made', (SELECT COUNT(*) FROM public.observations WHERE user_id = user_id_to_check),
        'reports_created', (SELECT COUNT(*) FROM public.reports WHERE user_id = user_id_to_check),
        'roles', (SELECT json_agg(r.name) FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = user_id_to_check)
    ) INTO result;
    
    RETURN result;
END;
$$;