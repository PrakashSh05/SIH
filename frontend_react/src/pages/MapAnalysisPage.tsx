import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Title, Text } from '@mantine/core';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Hotspot {
    cluster_id: number;
    point_count: number;
    hotspot_lat: number;
    hotspot_lng: number;
}

export default function MapAnalysisPage() {
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotspots = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_observation_hotspots');
            if (error) {
                console.error("Error fetching hotspots:", error);
            } else {
                setHotspots(data);
            }
            setLoading(false);
        };
        fetchHotspots();
    }, []);

    return (
        <>
            <Title order={2}>Map Analysis</Title>
            <Text c="dimmed" mb="xl">Observation hotspots generated dynamically from report density.</Text>

            <div style={{ height: '70vh', width: '100%' }}>
                {loading ? <Text>Loading map...</Text> : (
                    <MapContainer center={[13.08, 80.27]} zoom={7} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {hotspots.map(spot => (
                            <CircleMarker
                                key={spot.cluster_id}
                                center={[spot.hotspot_lat, spot.hotspot_lng]}
                                radius={Math.min(10 + spot.point_count * 2, 50)}
                                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.5 }}
                            >
                                <Popup>
                                    A hotspot containing {spot.point_count} observations.
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </>
    );
}