-- Helper function to check a user's role
CREATE OR REPLACE FUNCTION public.check_user_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Return false for anonymous users
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user has the specified role
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = role_name
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Return false on any error to fail safely
        RETURN false;
END;
$$;

-- Enable RLS on the tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for the 'projects' table

-- Policy 1: Administrators can do anything
CREATE POLICY "projects_admin_all" ON public.projects
    FOR ALL TO authenticated
    USING (public.check_user_role('Administrator'))
    WITH CHECK (public.check_user_role('Administrator'));

-- Policy 2: Researchers can view all projects
CREATE POLICY "projects_researcher_select" ON public.projects
    FOR SELECT TO authenticated
    USING (public.check_user_role('Researcher'));

-- Policy 3: Researchers can create projects
CREATE POLICY "projects_researcher_insert" ON public.projects
    FOR INSERT TO authenticated
    WITH CHECK (public.check_user_role('Researcher') AND owner_id = auth.uid());

-- Policy 4: Researchers can only update their own projects
CREATE POLICY "projects_owner_update" ON public.projects
    FOR UPDATE TO authenticated
    USING (owner_id = auth.uid() AND public.check_user_role('Researcher'))
    WITH CHECK (owner_id = auth.uid());

-- RLS Policies for the 'observations' table

-- Administrators can do anything
CREATE POLICY "observations_admin_all" ON public.observations
    FOR ALL TO authenticated
    USING (public.check_user_role('Administrator'))
    WITH CHECK (public.check_user_role('Administrator'));

-- Researchers can view all observations
CREATE POLICY "observations_researcher_select" ON public.observations
    FOR SELECT TO authenticated
    USING (public.check_user_role('Researcher'));

-- Users can create observations
CREATE POLICY "observations_user_insert" ON public.observations
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own observations
CREATE POLICY "observations_owner_update" ON public.observations
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for the 'reports' table

-- Administrators can do anything
CREATE POLICY "reports_admin_all" ON public.reports
    FOR ALL TO authenticated
    USING (public.check_user_role('Administrator'))
    WITH CHECK (public.check_user_role('Administrator'));

-- Researchers can view all reports
CREATE POLICY "reports_researcher_select" ON public.reports
    FOR SELECT TO authenticated
    USING (public.check_user_role('Researcher'));

-- Users can create reports
CREATE POLICY "reports_user_insert" ON public.reports
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own reports
CREATE POLICY "reports_owner_update" ON public.reports
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for profiles

-- Users can view their own profile
CREATE POLICY "profiles_owner_select" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_owner_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Administrators can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles
    FOR SELECT TO authenticated
    USING (public.check_user_role('Administrator'));

-- RLS Policies for user_roles

-- Users can view their own roles
CREATE POLICY "user_roles_owner_select" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Administrators can manage all user roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.check_user_role('Administrator'))
    WITH CHECK (public.check_user_role('Administrator'));