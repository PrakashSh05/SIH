-- Table for projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for observations
CREATE TABLE public.observations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    data JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT,
    file_path TEXT,
    report_type TEXT DEFAULT 'general' CHECK (report_type IN ('general', 'analysis', 'summary')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for social media posts
CREATE TABLE public.social_media_posts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    source_id TEXT UNIQUE NOT NULL,
    source_platform TEXT NOT NULL CHECK (source_platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'other')),
    author TEXT,
    raw_text TEXT NOT NULL CHECK (length(trim(raw_text)) > 0),
    posted_at TIMESTAMPTZ,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    sentiment_score REAL CHECK (sentiment_score BETWEEN -1 AND 1),
    topic TEXT,
    topic_score REAL CHECK (topic_score BETWEEN 0 AND 1),
    processed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'error'))
);

-- Add indexes for better performance
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_observations_user_id ON public.observations(user_id);
CREATE INDEX idx_observations_project_id ON public.observations(project_id);
CREATE INDEX idx_observations_observed_at ON public.observations(observed_at);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_project_id ON public.reports(project_id);
CREATE INDEX idx_social_media_posts_platform ON public.social_media_posts(source_platform);
CREATE INDEX idx_social_media_posts_ingested_at ON public.social_media_posts(ingested_at);
CREATE INDEX idx_social_media_posts_status ON public.social_media_posts(status);