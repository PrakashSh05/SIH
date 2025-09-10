-- Add location columns to observations table
ALTER TABLE public.observations 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11,8);

-- Add location columns to projects table for area center point
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS center_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS center_lng DECIMAL(11,8);

-- Add location columns to social media posts table
ALTER TABLE public.social_media_posts 
ADD COLUMN IF NOT EXISTS extracted_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS extracted_lng DECIMAL(11,8);

-- Add location metadata columns
ALTER TABLE public.observations 
ADD COLUMN IF NOT EXISTS location_accuracy REAL CHECK (location_accuracy >= 0),
ADD COLUMN IF NOT EXISTS location_source TEXT DEFAULT 'manual' CHECK (location_source IN ('manual', 'gps', 'geocoded', 'estimated'));

ALTER TABLE public.social_media_posts 
ADD COLUMN IF NOT EXISTS geocoding_confidence REAL CHECK (geocoding_confidence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS location_method TEXT DEFAULT 'extracted' CHECK (location_method IN ('extracted', 'geocoded', 'user_provided'));

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS observations_location_lat_lng_idx 
ON public.observations (location_lat, location_lng) 
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS projects_center_lat_lng_idx 
ON public.projects (center_lat, center_lng) 
WHERE center_lat IS NOT NULL AND center_lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS social_posts_location_lat_lng_idx 
ON public.social_media_posts (extracted_lat, extracted_lng) 
WHERE extracted_lat IS NOT NULL AND extracted_lng IS NOT NULL;

-- Add spatial bounds check constraints
ALTER TABLE public.observations 
ADD CONSTRAINT valid_latitude CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90)),
ADD CONSTRAINT valid_longitude CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180));

ALTER TABLE public.projects 
ADD CONSTRAINT valid_center_latitude CHECK (center_lat IS NULL OR (center_lat >= -90 AND center_lat <= 90)),
ADD CONSTRAINT valid_center_longitude CHECK (center_lng IS NULL OR (center_lng >= -180 AND center_lng <= 180));

ALTER TABLE public.social_media_posts 
ADD CONSTRAINT valid_extracted_latitude CHECK (extracted_lat IS NULL OR (extracted_lat >= -90 AND extracted_lat <= 90)),
ADD CONSTRAINT valid_extracted_longitude CHECK (extracted_lng IS NULL OR (extracted_lng >= -180 AND extracted_lng <= 180));

-- Add comments
COMMENT ON COLUMN public.observations.location_lat IS 'Latitude in decimal degrees (WGS84)';
COMMENT ON COLUMN public.observations.location_lng IS 'Longitude in decimal degrees (WGS84)';
COMMENT ON COLUMN public.observations.location_accuracy IS 'Location accuracy in meters';
COMMENT ON COLUMN public.observations.location_source IS 'Source of location data';