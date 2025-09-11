CREATE OR REPLACE FUNCTION public.get_dashboard_aggregates()
RETURNS json
LANGUAGE sql
AS $$
    SELECT json_build_object(
        'observations_by_status', (
            SELECT json_agg(t)
            FROM (
                SELECT status, COUNT(*) AS count
                FROM public.observations
                GROUP BY status
            ) t
        ),
        'reports_by_type', (
            SELECT json_agg(t)
            FROM (
                SELECT report_type, COUNT(*) AS count
                FROM public.reports
                GROUP BY report_type
            ) t
        )
    );
$$;