import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Title, Text, Paper, Group, SimpleGrid, RingProgress, Center } from '@mantine/core';
import { IconReport, IconBook, IconMapPin } from '@tabler/icons-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            // This calls the custom SQL function you created
            const { data, error } = await supabase.rpc('get_user_stats', { target_user_id: user.id });
            if (error) {
                console.error("Error fetching stats:", error);
            } else {
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    if (loading) return <Text>Loading dashboard...</Text>;
    if (!stats) return <Text>Could not load user statistics.</Text>;

    const statCards = [
        { title: 'Projects Created', value: stats.projects_created, icon: IconBook },
        { title: 'Observations Logged', value: stats.observations_made, icon: IconMapPin },
        { title: 'Reports Filed', value: stats.reports_created, icon: IconReport },
    ];

    return (
        <>
            <Title order={2}>Dashboard</Title>
            <Text c="dimmed" mb="xl">Welcome back, {user?.email}</Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }}>
                {statCards.map((stat) => (
                    <Paper withBorder p="md" radius="md" key={stat.title}>
                        <Group>
                            <RingProgress
                                sections={[{ value: 100, color: 'blue' }]}
                                label={
                                    <Center>
                                        <stat.icon style={{ width: '70%', height: '70%' }} />
                                    </Center>
                                }
                            />
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>{stat.title}</Text>
                                <Text fw={700} size="xl">{stat.value}</Text>
                            </div>
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>
        </>
    );
}