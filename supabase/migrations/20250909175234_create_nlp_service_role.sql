-- Create a new role (user) for the NLP service
-- Note: Password should be set via environment variables in production
DO $$
BEGIN
    -- Check if role already exists
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nlp_service_worker') THEN
        CREATE ROLE nlp_service_worker WITH LOGIN;
        RAISE NOTICE 'Created nlp_service_worker role - set password via ALTER ROLE';
    ELSE
        RAISE NOTICE 'nlp_service_worker role already exists';
    END IF;
END
$$;

-- Grant the role CONNECT permission to the database
GRANT CONNECT ON DATABASE postgres TO nlp_service_worker;

-- Grant USAGE permission on the public schema
GRANT USAGE ON SCHEMA public TO nlp_service_worker;

-- Grant specific permissions on the target table ONLY
GRANT INSERT, SELECT, UPDATE ON TABLE public.social_media_posts TO nlp_service_worker;

-- Grant permissions on the table's sequence for the ID column
GRANT USAGE, SELECT ON SEQUENCE public.social_media_posts_id_seq TO nlp_service_worker;

-- Create a comment to document the role's purpose
COMMENT ON ROLE nlp_service_worker IS 'Service account for NLP processing of social media posts';

-- Note: Set password separately for security
-- ALTER ROLE nlp_service_worker PASSWORD 'your_secure_password_here';