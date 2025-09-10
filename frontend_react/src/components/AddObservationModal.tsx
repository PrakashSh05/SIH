import { Modal, Button, TextInput, Textarea, NumberInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { notifications } from '@mantine/notifications';

interface Props {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddObservationModal({ opened, onClose, onSuccess }: Props) {
    const { user } = useAuth();
    const form = useForm({
        initialValues: {
            notes: '',
            lat: 0,
            lng: 0,
            salinity: 0,
        },
        validate: {
            lat: (val) => (val >= -90 && val <= 90 ? null : 'Invalid latitude'),
            lng: (val) => (val >= -180 && val <= 180 ? null : 'Invalid longitude'),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        if (!user) return;

        // Format location for PostGIS
        const location = `POINT(${values.lng} ${values.lat})`;

        const { error } = await supabase.from('observations').insert({
            user_id: user.id,
            notes: values.notes,
            location: location,
            // Fallback columns for non-PostGIS setups
            location_lat: values.lat,
            location_lng: values.lng,
            data: { salinity: values.salinity }, // Store flexible data in JSONB
        });

        if (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'Observation added', color: 'green' });
            onSuccess();
            onClose();
            form.reset();
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Add New Observation">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Textarea label="Notes" {...form.getInputProps('notes')} />
                <NumberInput label="Latitude" {...form.getInputProps('lat')} decimalScale={6} />
                <NumberInput label="Longitude" {...form.getInputProps('lng')} decimalScale={6} />
                <NumberInput label="Salinity" {...form.getInputProps('salinity')} decimalScale={2} />

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Modal>
    );
}