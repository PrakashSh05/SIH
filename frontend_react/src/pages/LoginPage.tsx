import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Paper, TextInput, Button, Text, Stack, Anchor, Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
// The incorrect 'AuthException' import has been removed.

export default function LoginPage() {
    const [isLoginView, setIsLoginView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error: any) { // Changed to handle the error object correctly
            notifications.show({
                title: 'Login Failed',
                message: error.message,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            if (data.user?.identities?.length === 0) {
                notifications.show({
                    title: 'User already exists',
                    message: 'This user already exists. Please sign in instead.',
                    color: 'yellow',
                });
            } else {
                notifications.show({
                    title: 'Signup Successful!',
                    message: 'Please check your email to confirm your account.',
                    color: 'green',
                });
            }
        } catch (error: any) { // Changed to handle the error object correctly
            notifications.show({
                title: 'Signup Failed',
                message: error.message,
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

    if (authLoading) {
        return <Center style={{ height: '100vh' }}><Loader /></Center>;
    }

    return (
        <Container size={420} my={40}>
            <Title ta="center">INCOIS Unified Platform</Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                {isLoginView ? 'Please sign in to continue' : 'Create a new account'}
            </Text>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <TextInput label="Password" placeholder="Your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Button type="submit" loading={loading} fullWidth mt="xl">
                            {isLoginView ? 'Sign in' : 'Sign up'}
                        </Button>
                    </Stack>
                </form>
            </Paper>
            <Text c="dimmed" size="sm" ta="center" mt={15}>
                {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                <Anchor component="button" size="sm" onClick={() => setIsLoginView(!isLoginView)}>
                    {isLoginView ? 'Sign up' : 'Sign in'}
                </Anchor>
            </Text>
        </Container>
    );
}