-- Function for proximity searches using Haversine formula
CREATE OR REPLACE FUNCTION public.nearby_observations(
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    radius_meters INTEGER DEFAULT 1000,
    max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    project_id UUID,
    observed_at TIMESTAMPTZ,
    data JSONB,
    notes TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    distance_meters NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        obs.id,
        obs.user_id,
        obs.project_id,
        obs.observed_at,
        obs.data,
        obs.notes,
        obs.location_lat,
        obs.location_lng,
        -- Haversine formula for distance calculation
        ROUND(
            (6371000 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(lat)) * cos(radians(obs.location_lat)) *
                    cos(radians(obs.location_lng) - radians(lng)) +
                    sin(radians(lat)) * sin(radians(obs.location_lat))
                ))
            ))::numeric, 2
        ) AS distance_meters
    FROM
        public.observations AS obs
    WHERE
        obs.location_lat IS NOT NULL 
        AND obs.location_lng IS NOT NULL
        -- Quick bounding box filter for performance
        AND obs.location_lat BETWEEN (lat - (radius_meters::decimal / 111000.0)) AND (lat + (radius_meters::decimal / 111000.0))
        AND obs.location_lng BETWEEN (lng - (radius_meters::decimal / (111000.0 * cos(radians(lat))))) AND (lng + (radius_meters::decimal / (111000.0 * cos(radians(lat)))))
        -- Apply exact distance filter
        AND (6371000 * acos(
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(lat)) * cos(radians(obs.location_lat)) *
                cos(radians(obs.location_lng) - radians(lng)) +
                sin(radians(lat)) * sin(radians(obs.location_lat))
            ))
        )) <= radius_meters
    ORDER BY
        distance_meters
    LIMIT max_results;
$$;

-- Function for bounding box queries
CREATE OR REPLACE FUNCTION public.observations_in_bounds(
    min_lat DECIMAL(10,8),
    min_lng DECIMAL(11,8),
    max_lat DECIMAL(10,8),
    max_lng DECIMAL(11,8),
    max_results INTEGER DEFAULT 500
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    project_id UUID,
    observed_at TIMESTAMPTZ,
    data JSONB,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        obs.id,
        obs.user_id,
        obs.project_id,
        obs.observed_at,
        obs.data,
        obs.location_lat,
        obs.location_lng
    FROM public.observations obs
    WHERE
        obs.location_lat IS NOT NULL 
        AND obs.location_lng IS NOT NULL
        AND obs.location_lat BETWEEN min_lat AND max_lat
        AND obs.location_lng BETWEEN min_lng AND max_lng
    ORDER BY obs.observed_at DESC
    LIMIT max_results;
$$;

-- Function to find observations near a project's center
CREATE OR REPLACE FUNCTION public.observations_near_project(
    project_uuid UUID,
    radius_meters INTEGER DEFAULT 5000,
    max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    observed_at TIMESTAMPTZ,
    data JSONB,
    distance_meters NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    project_lat DECIMAL(10,8);
    project_lng DECIMAL(11,8);
BEGIN
    -- Get project center coordinates
    SELECT center_lat, center_lng INTO project_lat, project_lng
    FROM public.projects
    WHERE id = project_uuid;
    
    -- Return empty result if project not found or no coordinates
    IF project_lat IS NULL OR project_lng IS NULL THEN
        RETURN;
    END IF;
    
    -- Use the nearby_observations function
    RETURN QUERY
    SELECT 
        obs.id,
        obs.observed_at,
        obs.data,
        obs.distance_meters
    FROM public.nearby_observations(project_lat, project_lng, radius_meters, max_results) obs;
END;
$$;

-- Function to get location statistics
CREATE OR REPLACE FUNCTION public.get_location_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT json_build_object(
        'observations_with_location', (
            SELECT COUNT(*) FROM public.observations 
            WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL
        ),
        'observations_total', (
            SELECT COUNT(*) FROM public.observations
        ),
        'social_posts_with_location', (
            SELECT COUNT(*) FROM public.social_media_posts 
            WHERE extracted_lat IS NOT NULL AND extracted_lng IS NOT NULL
        ),
        'social_posts_total', (
            SELECT COUNT(*) FROM public.social_media_posts
        ),
        'projects_with_center', (
            SELECT COUNT(*) FROM public.projects 
            WHERE center_lat IS NOT NULL AND center_lng IS NOT NULL
        ),
        'projects_total', (
            SELECT COUNT(*) FROM public.projects
        ),
        'location_coverage_percent', (
            ROUND(
                (SELECT COUNT(*) FROM public.observations WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL)::numeric / 
                GREATEST(1, (SELECT COUNT(*) FROM public.observations))::numeric * 100, 2
            )
        )
    );
$$;

-- Function to validate coordinates
CREATE OR REPLACE FUNCTION public.is_valid_coordinates(
    lat DECIMAL(10,8),
    lng DECIMAL(11,8)
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT 
        lat IS NOT NULL 
        AND lng IS NOT NULL 
        AND lat BETWEEN -90 AND 90 
        AND lng BETWEEN -180 AND 180
        AND NOT (lat = 0 AND lng = 0); -- Exclude null island
$$;

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 DECIMAL(10,8),
    lng1 DECIMAL(11,8),
    lat2 DECIMAL(10,8),
    lng2 DECIMAL(11,8)
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE 
        WHEN public.is_valid_coordinates(lat1, lng1) AND public.is_valid_coordinates(lat2, lng2) THEN
            ROUND(
                (6371000 * acos(
                    LEAST(1.0, GREATEST(-1.0,
                        cos(radians(lat1)) * cos(radians(lat2)) *
                        cos(radians(lng2) - radians(lng1)) +
                        sin(radians(lat1)) * sin(radians(lat2))
                    ))
                ))::numeric, 2
            )
        ELSE
            NULL
    END;
$$;

-- Function to get bounding box around a point
CREATE OR REPLACE FUNCTION public.get_bounding_box(
    center_lat DECIMAL(10,8),
    center_lng DECIMAL(11,8),
    radius_meters INTEGER
)
RETURNS TABLE (
    min_lat DECIMAL(10,8),
    min_lng DECIMAL(11,8),
    max_lat DECIMAL(10,8),
    max_lng DECIMAL(11,8)
)
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT
        GREATEST(-90::DECIMAL(10,8), center_lat - (radius_meters::decimal / 111000.0)) as min_lat,
        GREATEST(-180::DECIMAL(11,8), center_lng - (radius_meters::decimal / (111000.0 * cos(radians(center_lat))))) as min_lng,
        LEAST(90::DECIMAL(10,8), center_lat + (radius_meters::decimal / 111000.0)) as max_lat,
        LEAST(180::DECIMAL(11,8), center_lng + (radius_meters::decimal / (111000.0 * cos(radians(center_lat))))) as max_lng;
$$;

-- Function to cluster nearby observations
CREATE OR REPLACE FUNCTION public.cluster_observations(
    cluster_radius_meters INTEGER DEFAULT 1000,
    min_cluster_size INTEGER DEFAULT 2
)
RETURNS TABLE (
    cluster_id INTEGER,
    center_lat DECIMAL(10,8),
    center_lng DECIMAL(11,8),
    observation_count BIGINT,
    observation_ids UUID[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    obs_record RECORD;
    cluster_counter INTEGER := 0;
    processed_obs UUID[] := '{}';
BEGIN
    -- Simple clustering algorithm: for each unprocessed observation,
    -- find all nearby observations within cluster_radius_meters
    
    FOR obs_record IN 
        SELECT id, location_lat, location_lng 
        FROM public.observations 
        WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL
        ORDER BY observed_at
    LOOP
        -- Skip if already processed
        IF obs_record.id = ANY(processed_obs) THEN
            CONTINUE;
        END IF;
        
        -- Find nearby observations
        WITH nearby_obs AS (
            SELECT id, location_lat, location_lng
            FROM public.nearby_observations(
                obs_record.location_lat, 
                obs_record.location_lng, 
                cluster_radius_meters,
                1000
            )
            WHERE NOT (id = ANY(processed_obs))
        )
        SELECT 
            cluster_counter + 1,
            AVG(no.location_lat),
            AVG(no.location_lng),
            COUNT(*),
            array_agg(no.id)
        INTO cluster_id, center_lat, center_lng, observation_count, observation_ids
        FROM nearby_obs no;
        
        -- Only return clusters with minimum size
        IF observation_count >= min_cluster_size THEN
            cluster_counter := cluster_counter + 1;
            processed_obs := processed_obs || observation_ids;
            RETURN NEXT;
        ELSE
            -- Mark single observation as processed
            processed_obs := processed_obs || obs_record.id;
        END IF;
    END LOOP;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION public.nearby_observations IS 'Find observations within a specified radius using Haversine formula';
COMMENT ON FUNCTION public.observations_in_bounds IS 'Find observations within a bounding box (rectangular area)';
COMMENT ON FUNCTION public.observations_near_project IS 'Find observations near a project center point';
COMMENT ON FUNCTION public.calculate_distance IS 'Calculate distance between two lat/lng points in meters';
COMMENT ON FUNCTION public.cluster_observations IS 'Simple clustering of nearby observations';