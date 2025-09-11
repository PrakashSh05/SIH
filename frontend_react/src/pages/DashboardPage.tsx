import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Title, Text, Paper, SimpleGrid, Group, Button } from '@mantine/core'; // Import Group and Button
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

export default function DashboardPage() {
    const { t, i18n } = useTranslation(); // 2. Initialize the hook
    const [aggregates, setAggregates] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAggregates = async () => {
            const { data, error } = await supabase.rpc('get_dashboard_aggregates');
            if (error) {
                console.error("Error fetching aggregates:", error);
            } else {
                setAggregates(data);
            }
            setLoading(false);
        };
        fetchAggregates();
    }, []);

    if (loading) return <Text>Loading dashboard...</Text>;

    return (
        <>
            {/* 3. Replace hardcoded text with the t() function */}
            <Title order={2}>{t('dashboardTitle')}</Title>
            <Text c="dimmed" mb="xl">{t('dashboardSubtitle')}</Text>

            {/* 4. Add buttons to change the language */}
            <Group mb="md">
                <Button onClick={() => i18n.changeLanguage('en')} variant={i18n.language === 'en' ? 'filled' : 'default'}>English</Button>
                <Button onClick={() => i18n.changeLanguage('hi')} variant={i18n.language === 'hi' ? 'filled' : 'default'}>हिन्दी</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, lg: 2 }}>
                <Paper withBorder p="md" radius="md">
                    <Title order={4} mb="md">{t('observationsByStatusChartTitle')}</Title>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aggregates?.observations_by_status || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Title order={4} mb="md">{t('reportsByTypeChartTitle')}</Title>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aggregates?.reports_by_type || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="report_type" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </SimpleGrid>
        </>
    );
}