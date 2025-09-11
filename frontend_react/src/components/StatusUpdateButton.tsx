import { Menu, Button } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { supabase } from '../supabaseClient';
import { notifications } from '@mantine/notifications';

interface Props {
    observationId: string;
    currentStatus: string;
    onStatusUpdate: () => void;
}

export default function StatusUpdateButton({ observationId, currentStatus, onStatusUpdate }: Props) {
    const handleUpdateStatus = async (newStatus: string) => {
        const { error } = await supabase.rpc('update_observation_status', {
            observation_id_to_update: observationId,
            new_status: newStatus,
        });

        if (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: `Status updated to ${newStatus}`, color: 'green' });
            onStatusUpdate();
        }
    };

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Button size="xs" rightSection={<IconChevronDown size={14} />}>{currentStatus}</Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Change Status</Menu.Label>
                <Menu.Item onClick={() => handleUpdateStatus('verified')}>Verified</Menu.Item>
                <Menu.Item onClick={() => handleUpdateStatus('rejected')}>Rejected</Menu.Item>
                <Menu.Item onClick={() => handleUpdateStatus('pending')}>Pending</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}