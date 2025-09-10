-- Check if PostGIS is available before adding geography columns
DO $$
BEGIN
    -- Add a point location column to the observations table
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        ALTER TABLE public.observations ADD COLUMN location GEOGRAPHY(POINT, 4326);
        
        -- Add a polygon column to the projects table to define an area of interest
        ALTER TABLE public.projects ADD COLUMN area_of_interest GEOGRAPHY(POLYGON, 4326);
        
        -- Add a location column to the social media posts table for geocoded entities
        ALTER TABLE public.social_media_posts ADD COLUMN extracted_location GEOGRAPHY(POINT, 4326);
        
        RAISE NOTICE 'Geospatial columns added successfully';
    ELSE
        -- Add placeholder columns that can be upgraded later
        ALTER TABLE public.observations ADD COLUMN location_lat DECIMAL(10,8);
        ALTER TABLE public.observations ADD COLUMN location_lng DECIMAL(11,8);
        ALTER TABLE public.social_media_posts ADD COLUMN extracted_lat DECIMAL(10,8);
        ALTER TABLE public.social_media_posts ADD COLUMN extracted_lng DECIMAL(11,8);
        
        RAISE NOTICE 'PostGIS not available - using lat/lng columns instead';
    END IF;
END
$$;