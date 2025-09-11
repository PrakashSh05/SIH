import { Modal, Button, Textarea, NumberInput, Group, FileInput, LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { IconUpload } from '@tabler/icons-react';

interface Props {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddObservationModal({ opened, onClose }: Props) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

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
        setIsUploading(true);

        let mediaPath = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('observation_media')
                .upload(filePath, file);

            if (uploadError) {
                notifications.show({ title: 'Upload Error', message: uploadError.message, color: 'red' });
                setIsUploading(false);
                return;
            }
            mediaPath = filePath;
        }

        const locationWkt = `POINT(${values.lng} ${values.lat})`;

        const { error: insertError } = await supabase.from('observations').insert({
            user_id: user.id,
            notes: values.notes,
            location: locationWkt,
            location_lat: values.lat,
            location_lng: values.lng,
            data: { salinity: values.salinity },
            media_path: mediaPath,
        });

        if (insertError) {
            notifications.show({ title: 'Error', message: insertError.message, color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'Observation added', color: 'green' });
            // onSuccess(); // No longer needed due to real-time subscription
            handleClose();
        }
        setIsUploading(false);
    };

    const handleClose = () => {
        form.reset();
        setFile(null);
        onClose();
    }

    return (
        <Modal opened={opened} onClose={handleClose} title="Add New Observation">
            <LoadingOverlay visible={isUploading} />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Textarea label="Notes" placeholder="Describe what you observed" {...form.getInputProps('notes')} required />
                <NumberInput label="Latitude" {...form.getInputProps('lat')} decimalScale={6} required />
                <NumberInput label="Longitude" {...form.getInputProps('lng')} decimalScale={6} required />
                <NumberInput label="Salinity (optional)" {...form.getInputProps('salinity')} decimalScale={2} />

                <FileInput
                    mt="md"
                    label="Upload Media"
                    placeholder="Select a photo or video"
                    leftSection={<IconUpload size={14} />}
                    value={file}
                    onChange={setFile}
                    clearable
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Modal>
    );
}