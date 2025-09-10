import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import L from 'leaflet';

// Fix for default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Observation {
    id: string;
    lat: number;
    lng: number;
    notes: string;
    data: any;
}

const ObservationsMap = () => {
    const [observations, setObservations] = useState<Observation[]>([]);

    useEffect(() => {
        const fetchNearbyObservations = async () => {
            const { data, error } = await supabase.rpc('nearby_observations', {
                center_lat: 13.08, // Note the arg name change
                center_lng: 80.27, // Note the arg name change
                radius_meters: 500000
            });
            if (error) {
                console.error('Error fetching observations:', error);
            } else if (data) {
                setObservations(data);
            }
        };
        fetchNearbyObservations();
    }, []);

    return (
        <MapContainer center={[13.08, 80.27]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {observations.map(obs => (
                <Marker key={obs.id} position={[obs.lat, obs.lng]}>
                    <Popup>
                        Notes: {obs.notes || "N/A"} <br />
                        Data: {JSON.stringify(obs.data)}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ObservationsMap;