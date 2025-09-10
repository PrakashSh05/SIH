-- Enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Enable PostGIS for geospatial capabilities
-- Note: PostGIS may not be available on all Supabase tiers
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
EXCEPTION
    WHEN undefined_file THEN
        RAISE NOTICE 'PostGIS extension not available - geospatial features will be limited';
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Insufficient privileges to install PostGIS';
END
$$;

-- Enable additional useful extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;