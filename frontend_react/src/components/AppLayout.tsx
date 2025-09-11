import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBar, IconMap2, IconMapPin, IconMessage2, IconLogout } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AppLayout() {
    const [opened, { toggle }] = useDisclosure();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // CORRECTED: Paths now include the "/admin" prefix
    const navLinks = [
        { icon: IconChartBar, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: IconMapPin, label: 'Observations', path: '/admin/observations' },
        { icon: IconMap2, label: 'Map Analysis', path: '/admin/map-analysis' },
        { icon: IconMessage2, label: 'Social Feed', path: '/admin/social-feed' },
    ];

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Text fw={500}>Admin & Analyst Portal</Text>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.label}
                        label={link.label}
                        leftSection={<link.icon size="1rem" stroke={1.5} />}
                        onClick={() => navigate(link.path)}
                        active={location.pathname === link.path}
                    />
                ))}
                <NavLink
                    label="Logout"
                    leftSection={<IconLogout size="1rem" stroke={1.5} />}
                    onClick={handleLogout}
                    mt="auto"
                />
            </AppShell.Navbar>

            <AppShell.Main><Outlet /></AppShell.Main>
        </AppShell>
    );
}