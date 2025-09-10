import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Title, Paper, TextInput, Button, Text, Stack, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function LoginPage() {
    const [isLoginView, setIsLoginView] = useState(true); // State to toggle views
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // The onAuthStateChange listener will handle the redirect
        } catch (error: any) {
            notifications.show({
                title: 'Login Failed',
                message: error.error_description || error.message,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    // NEW: Function to handle user sign-ups
    const handleSignUp = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            // By default, Supabase requires email confirmation
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                notifications.show({
                    title: 'Signup Almost Complete!',
                    message: 'This user already exists. Please login.',
                    color: 'yellow',
                });
            } else {
                notifications.show({
                    title: 'Signup Successful!',
                    message: 'Please check your email to confirm your account.',
                    color: 'green',
                });
            }

        } catch (error: any) {
            notifications.show({
                title: 'Signup Failed',
                message: error.error_description || error.message,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoginView) {
            handleLogin();
        } else {
            handleSignUp();
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center">INCOIS Unified Platform</Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                {isLoginView ? 'Please sign in to continue' : 'Create a new account'}
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextInput
                            label="Password"
                            placeholder="Your password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" loading={loading} fullWidth mt="xl">
                            {isLoginView ? 'Sign in' : 'Sign up'}
                        </Button>
                    </Stack>
                </form>
            </Paper>

            {/* NEW: Toggle between Login and Signup views */}
            <Text c="dimmed" size="sm" ta="center" mt={15}>
                {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                <Anchor component="button" size="sm" onClick={() => setIsLoginView(!isLoginView)}>
                    {isLoginView ? 'Sign up' : 'Sign in'}
                </Anchor>
            </Text>
        </Container>
    );
}