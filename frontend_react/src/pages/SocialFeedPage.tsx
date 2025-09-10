import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Title, Text, Paper, Stack, Badge, Group } from '@mantine/core';

export default function SocialFeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('social_media_posts')
                .select('*')
                .order('posted_at', { ascending: false })
                .limit(25);

            if (error) {
                console.error("Error fetching social media posts:", error);
            } else {
                setPosts(data);
            }
            setLoading(false);
        };
        fetchPosts();
    }, []);

    return (
        <>
            <Title order={2}>Social Media Intelligence Feed</Title>
            <Text c="dimmed" mb="xl">Real-time data ingested and processed by the intelligence pipeline.</Text>

            {loading && <Text>Loading feed...</Text>}

            <Stack>
                {posts.map(post => (
                    <Paper key={post.id} withBorder p="md">
                        <Text mb="xs">{post.raw_text}</Text>
                        <Group>
                            <Badge color="blue">Topic: {post.topic || 'N/A'}</Badge>
                            <Badge color="green">Sentiment: {post.sentiment || 'N/A'}</Badge>
                            <Text size="xs" c="dimmed">from @{post.author} on {post.source_platform}</Text>
                        </Group>
                    </Paper>
                ))}
            </Stack>
        </>
    );
}