import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader, Center } from '@mantine/core';

export default function RoleBasedRedirector() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data, error } = await supabase.rpc('get_my_role');
            if (error) {
                console.error('Error fetching user role:', error);
            } else {
                setRole(data);
            }
            setLoading(false);
        };

        fetchUserRole();
    }, []);

    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <Loader />
            </Center>
        );
    }

    // Redirect based on the fetched role
    switch (role) {
        case 'Citizen':
            return <Navigate to="/citizen/map" replace />;
        case 'Official':
            return <Navigate to="/official/dashboard" replace />;
        case 'Analyst':
        case 'Administrator':
            return <Navigate to="/admin/dashboard" replace />;
        default:
            // Fallback for users with no role or an unknown role
            return <Navigate to="/login" replace />;
    }
}