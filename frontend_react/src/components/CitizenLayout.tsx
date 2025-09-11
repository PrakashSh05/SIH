import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMap, IconPlus, IconLogout } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CitizenLayout() {
    const [opened, { toggle }] = useDisclosure();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navLinks = [
        { icon: IconMap, label: 'Hazard Map', path: '/citizen/map' },
        { icon: IconPlus, label: 'New Report', path: '/citizen/report' },
    ];

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Text>Citizen Portal</Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                {navLinks.map((link) => (
                    <NavLink key={link.label} label={link.label} leftSection={<link.icon size="1rem" />} onClick={() => navigate(link.path)} active={location.pathname === link.path} />
                ))}
                <NavLink label="Logout" leftSection={<IconLogout size="1rem" />} onClick={handleLogout} mt="auto" />
            </AppShell.Navbar>
            <AppShell.Main><Outlet /></AppShell.Main>
        </AppShell>
    );
}