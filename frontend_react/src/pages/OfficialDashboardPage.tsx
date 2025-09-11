import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { supabase } from '../supabaseClient'; // 2. Import supabase client
import { Title, Text, Table, AppShell, Group, Button } from '@mantine/core'; // 3. Import Button
import { IconLogout } from '@tabler/icons-react'; // 4. Import the icon
import StatusUpdateButton from '../components/StatusUpdateButton';

export default function OfficialDashboardPage() {
    const [observations, setObservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // 5. Initialize navigate

    // 6. Add the logout handler function
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    const fetchAllObservations = async () => {
        const { data, error } = await supabase.from('observations').select('*').order('observed_at', { ascending: false });
        if (error) console.error(error);
        else setObservations(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllObservations();
    }, []);

    const rows = observations.map((obs) => (
        <Table.Tr key={obs.id}>
            <Table.Td>{new Date(obs.observed_at).toLocaleString()}</Table.Td>
            <Table.Td>{obs.notes}</Table.Td>
            <Table.Td>
                <StatusUpdateButton
                    observationId={obs.id}
                    currentStatus={obs.status}
                    onStatusUpdate={fetchAllObservations}
                />
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <AppShell header={{ height: 60 }} padding="md">
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between"> {/* Use space-between */}
                    <Text fw={500}>Official Portal</Text>
                    {/* 7. Add the logout button to the header */}
                    <Button
                        variant="default"
                        leftSection={<IconLogout size={14} />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Group>
            </AppShell.Header>
            <AppShell.Main>
                <Title order={2}>Verification Dashboard</Title>
                <Text c="dimmed" mb="xl">Review and update incoming citizen reports.</Text>
                <Table>
                    <Table.Thead>
                        <Table.Tr><Table.Th>Observed At</Table.Th><Table.Th>Notes</Table.Th><Table.Th>Status</Table.Th></Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{loading ? <Table.Tr><Table.Td colSpan={3}>Loading...</Table.Td></Table.Tr> : rows}</Table.Tbody>
                </Table>
            </AppShell.Main>
        </AppShell>
    );
}