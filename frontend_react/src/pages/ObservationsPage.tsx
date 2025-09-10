import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Title, Text, Table, Button, Group } from '@mantine/core';
import AddObservationModal from '../components/AddObservationModal';

export default function ObservationsPage() {
    const [observations, setObservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchObservations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('observations')
            .select('id, observed_at, notes, data, status')
            .order('observed_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching observations:", error);
        } else {
            setObservations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchObservations();
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
            <AddObservationModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                onSuccess={fetchObservations}
            />

            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2}>Scientific Observations</Title>
                    <Text c="dimmed">Log and view field data.</Text>
                </div>
                <Button onClick={() => setModalOpened(true)}>Add Observation</Button>
            </Group>

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