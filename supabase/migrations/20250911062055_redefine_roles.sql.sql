-- To ensure a clean slate, we remove the old roles first.
DELETE FROM public.roles;

-- Insert the new, clearly defined roles for the platform.
INSERT INTO public.roles (name, description) VALUES
    ('Citizen', 'Can submit observations and view verified public hazards.'),
    ('Official', 'Can view all observations and verify/update their status.'),
    ('Analyst', 'Can perform detailed analysis, view all data, and manage dashboards.'),
    ('Administrator', 'Has full system access, including user management.');