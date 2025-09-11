INSERT INTO storage.buckets (id, name, public)
VALUES ('observation_media', 'observation_media', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'observation_media' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view their observation media"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'observation_media' AND
    EXISTS (
        SELECT 1
        FROM public.observations
        WHERE observations.media_path = storage.objects.name
    )
);