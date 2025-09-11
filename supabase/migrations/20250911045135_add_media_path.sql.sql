ALTER TABLE public.observations
ADD COLUMN media_path TEXT;

COMMENT ON COLUMN public.observations.media_path IS 'Path to an associated file in Supabase Storage bucket (observation_media)';