-- Create spatial indexes only if PostGIS is available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        -- Create a GIST index on the location column of the observations table
        CREATE INDEX IF NOT EXISTS observations_location_idx 
        ON public.observations USING GIST (location);

        -- Create a GIST index on the area_of_interest column of the projects table
        CREATE INDEX IF NOT EXISTS projects_area_of_interest_idx 
        ON public.projects USING GIST (area_of_interest);

        -- Create a GIST index on the extracted_location column of social media posts
        CREATE INDEX IF NOT EXISTS social_media_posts_location_idx 
        ON public.social_media_posts USING GIST (extracted_location);

        RAISE NOTICE 'Spatial indexes created successfully';
    ELSE
        -- Create regular indexes on lat/lng columns
        CREATE INDEX IF NOT EXISTS observations_lat_lng_idx 
        ON public.observations (location_lat, location_lng) 
        WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

        CREATE INDEX IF NOT EXISTS social_media_posts_lat_lng_idx 
        ON public.social_media_posts (extracted_lat, extracted_lng) 
        WHERE extracted_lat IS NOT NULL AND extracted_lng IS NOT NULL;

        RAISE NOTICE 'Regular lat/lng indexes created (PostGIS not available)';
    END IF;
END
$$;

-- Create additional useful indexes
CREATE INDEX IF NOT EXISTS observations_data_idx ON public.observations USING GIN (data);
CREATE INDEX IF NOT EXISTS social_media_posts_text_search_idx 
ON public.social_media_posts USING GIN (to_tsvector('english', raw_text));