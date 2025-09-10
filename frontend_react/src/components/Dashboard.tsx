import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ObservationsMap from './ObservationsMap';

// Define a type for our profile data
type Profile = {
    full_name: string;
    username: string;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            // Your RLS policy allows users to select their own profile
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, username')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        };
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div>
            <h2>Welcome, {profile?.full_name || user?.email}</h2>
            <button onClick={handleLogout}>Logout</button>
            <hr />
            <h3>Observations Map</h3>
            <div style={{ height: '60vh', width: '100%' }}>
                <ObservationsMap />
            </div>
        </div>
    );
}