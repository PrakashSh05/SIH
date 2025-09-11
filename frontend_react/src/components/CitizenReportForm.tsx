import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import { Button, Textarea, FileInput, LoadingOverlay, Paper, Text, Group } from '@mantine/core';
import { IconUpload, IconMapPin } from '@tabler/icons-react';

export default function CitizenReportForm() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState('');

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLoading(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLoading(false);
            },
            () => {
                setLocationError('Unable to retrieve your location. Please enable location permissions.');
                setIsLoading(false);
            }
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !location) {
            notifications.show({ title: 'Error', message: 'Location and notes are required.', color: 'red' });
            return;
        }
        setIsLoading(true);

        let mediaPath = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `${user.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('observation_media').upload(filePath, file);

            if (uploadError) {
                notifications.show({ title: 'Upload Error', message: uploadError.message, color: 'red' });
                setIsLoading(false);
                return;
            }
            mediaPath = filePath;
        }

        const locationWkt = `POINT(${location.lng} ${location.lat})`;
        const { error: insertError } = await supabase.from('observations').insert({
            user_id: user.id,
            notes: notes,
            location: locationWkt,
            location_lat: location.lat,
            location_lng: location.lng,
            media_path: mediaPath,
        });

        if (insertError) {
            notifications.show({ title: 'Submission Error', message: insertError.message, color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'Report submitted successfully. Thank you!', color: 'green' });
            setNotes('');
            setFile(null);
            setLocation(null);
        }
        setIsLoading(false);
    };

    return (
        <Paper withBorder shadow="md" p={30} radius="md" style={{ position: 'relative' }}>
            <LoadingOverlay visible={isLoading} />
            <form onSubmit={handleSubmit}>
                <Textarea
                    label="Observation Notes"
                    placeholder="Describe the hazard, location details, and any other relevant information."
                    value={notes}
                    onChange={(event) => setNotes(event.currentTarget.value)}
                    minRows={4}
                    required
                />
                <FileInput
                    mt="md"
                    label="Upload Photo/Video"
                    placeholder="Select media"
                    leftSection={<IconUpload size={14} />}
                    value={file}
                    onChange={setFile}
                    clearable
                />
                <Group mt="md" justify="space-between" align="center">
                    {location ? (
                        <Text c="green" size="sm">Location Acquired!</Text>
                    ) : (
                        <Button leftSection={<IconMapPin size={14} />} variant="default" onClick={handleGetLocation}>
                            Get Current Location
                        </Button>
                    )}
                </Group>
                {locationError && <Text c="red" size="sm" mt="xs">{locationError}</Text>}

                <Button type="submit" fullWidth mt="xl" disabled={!location}>
                    Submit Report
                </Button>
            </form>
        </Paper>
    );
}