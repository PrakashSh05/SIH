import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Title, Text, Table, Button, Group, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import AddObservationModal from '../components/AddObservationModal';

export default function ObservationsPage() {
    const [observations, setObservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText] = useDebouncedValue(searchText, 500);

    const fetchObservations = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_filtered_observations', {
            search_text: debouncedSearchText || null,
        });

        if (error) {
            console.error("Error fetching observations:", error);
        } else {
            setObservations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchObservations();
    }, [debouncedSearchText]);

    useEffect(() => {
        const channel = supabase.channel('observations')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'observations' }, (payload) => {
                setObservations(currentObservations => [payload.new, ...currentObservations]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const rows = observations.map((obs) => (
        <Table.Tr key={obs.id}>
            <Table.Td>{new Date(obs.observed_at).toLocaleString()}</Table.Td>
            <Table.Td>{obs.notes}</Table.Td>
            <Table.Td>{obs.status}</Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <AddObservationModal opened={modalOpened} onClose={() => setModalOpened(false)} onSuccess={() => { }} />
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2}>Scientific Observations</Title>
                    <Text c="dimmed">Log and view field data. Updates in real-time.</Text>
                </div>
                <Button onClick={() => setModalOpened(true)}>Add Observation</Button>
            </Group>

            <TextInput
                placeholder="Search by notes..."
                value={searchText}
                onChange={(event) => setSearchText(event.currentTarget.value)}
                mb="md"
            />

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Observed At</Table.Th>
                        <Table.Th>Notes</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? <Table.Tr><Table.Td colSpan={3}>Loading...</Table.Td></Table.Tr> : rows}
                </Table.Tbody>
            </Table>
        </>
    );
}