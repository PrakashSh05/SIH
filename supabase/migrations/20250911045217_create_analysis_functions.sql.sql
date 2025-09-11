CREATE OR REPLACE FUNCTION public.get_observation_hotspots(
    eps_meters int DEFAULT 500,
    min_points int DEFAULT 3
)
RETURNS TABLE (
    cluster_id int,
    point_count bigint,
    hotspot_lat float,
    hotspot_lng float
)
LANGUAGE sql
AS $$
    SELECT
        cid AS cluster_id,
        COUNT(*) AS point_count,
        ST_Y(ST_Centroid(ST_Collect(location::geometry)))::float AS hotspot_lat,
        ST_X(ST_Centroid(ST_Collect(location::geometry)))::float AS hotspot_lng
    FROM (
        SELECT
            location,
            ST_ClusterDBSCAN(location::geometry, eps := eps_meters, minpoints := min_points) OVER () AS cid
        FROM
            public.observations
        WHERE location IS NOT NULL
    ) AS clustered_points
    WHERE
        cid IS NOT NULL
    GROUP BY
        cid
    ORDER BY
        point_count DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_filtered_observations(
    search_text text DEFAULT NULL,
    start_date timestamptz DEFAULT NULL,
    end_date timestamptz DEFAULT NULL
)
RETURNS SETOF public.observations
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.observations
    WHERE
        (search_text IS NULL OR notes ILIKE '%' || search_text || '%')
    AND
        (start_date IS NULL OR end_date IS NULL OR observed_at BETWEEN start_date AND end_date)
    ORDER BY
        observed_at DESC;
END;
$$;