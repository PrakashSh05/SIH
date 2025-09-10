-- Creates a function to find nearby observations.
-- It dynamically checks for PostGIS and uses the appropriate columns.
CREATE OR REPLACE FUNCTION public.nearby_observations(
    center_lat float,
    center_lng float,
    radius_meters float
)
RETURNS TABLE (
    id UUID,
    observed_at TIMESTAMPTZ,
    data JSONB,
    notes TEXT,
    lat float,
    lng float,
    distance_meters float
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if PostGIS geography column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'observations'
        AND column_name = 'location'
    ) THEN
        -- PostGIS is available, use geography functions
        RETURN QUERY
        SELECT
            o.id,
            o.observed_at,
            o.data,
            o.notes,
            ST_Y(o.location::geometry)::float AS lat,
            ST_X(o.location::geometry)::float AS lng,
            ST_Distance(
                o.location,
                ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
            )::float AS distance_meters
        FROM
            public.observations AS o
        WHERE
            ST_DWithin(
                o.location,
                ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
                radius_meters
            )
        ORDER BY distance_meters;
    ELSE
        -- PostGIS is not available, use Haversine distance on lat/lng columns
        RETURN QUERY
        SELECT
            o.id,
            o.observed_at,
            o.data,
            o.notes,
            o.location_lat::float,
            o.location_lng::float,
            (6371000 * acos(
                cos(radians(center_lat)) * cos(radians(o.location_lat)) *
                cos(radians(o.location_lng) - radians(center_lng)) +
                sin(radians(center_lat)) * sin(radians(o.location_lat))
            ))::float AS distance_meters
        FROM
            public.observations o
        WHERE
            -- Bounding box check first for performance
            o.location_lat BETWEEN center_lat - (radius_meters / 111000.0) AND center_lat + (radius_meters / 111000.0) AND
            o.location_lng BETWEEN center_lng - (radius_meters / (111000.0 * cos(radians(center_lat)))) AND center_lng + (radius_meters / (111000.0 * cos(radians(center_lat))))
            -- Then the more accurate distance check
            AND (6371000 * acos(
                cos(radians(center_lat)) * cos(radians(o.location_lat)) *
                cos(radians(o.location_lng) - radians(center_lng)) +
                sin(radians(center_lat)) * sin(radians(o.location_lat))
            )) <= radius_meters
        ORDER BY distance_meters;
    END IF;
END;
$$;