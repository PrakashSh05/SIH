-- First, drop all existing policies on the observations table to avoid conflicts.
DROP POLICY IF EXISTS "observations_admin_all" ON public.observations;
DROP POLICY IF EXISTS "observations_researcher_select" ON public.observations;
DROP POLICY IF EXISTS "observations_user_insert" ON public.observations;
DROP POLICY IF EXISTS "observations_owner_update" ON public.observations;
DROP POLICY IF EXISTS "Allow admin/analyst full access" ON public.observations;
DROP POLICY IF EXISTS "Allow officials to view all reports" ON public.observations;
DROP POLICY IF EXISTS "Allow officials to update report status" ON public.observations;
DROP POLICY IF EXISTS "Allow citizens to create reports" ON public.observations;
DROP POLICY IF EXISTS "Allow citizens to view own and verified reports" ON public.observations;

-- Policy for Admins/Analysts: They can do anything.
CREATE POLICY "Allow admin/analyst full access"
ON public.observations FOR ALL
USING (check_user_role('Administrator') OR check_user_role('Analyst'));

-- Policy for Officials: They can see all reports and update their status.
CREATE POLICY "Allow officials to view all reports"
ON public.observations FOR SELECT
USING (check_user_role('Official'));

CREATE POLICY "Allow officials to update report status"
ON public.observations FOR UPDATE
USING (check_user_role('Official'))
WITH CHECK (true);

-- Policy for Citizens: They can create reports, view their own reports, and view any report that has been marked 'verified' by an official.
CREATE POLICY "Allow citizens to create reports"
ON public.observations FOR INSERT
WITH CHECK (check_user_role('Citizen'));

CREATE POLICY "Allow citizens to view own and verified reports"
ON public.observations FOR SELECT
USING (
    (check_user_role('Citizen') AND user_id = auth.uid()) -- Can see their own reports
    OR
    (status = 'verified') -- Can see any verified report
);