import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcons } from '../utils/leaflet-icon-fix';

fixLeafletIcons();

export default function CitizenMapPage() {
    const [observations, setObservations] = useState<any[]>([]);

    useEffect(() => {
        const fetchVerifiedObservations = async () => {
            const { data, error } = await supabase.rpc('get_verified_observations');
            if (error) console.error(error);
            else setObservations(data);
        };
        fetchVerifiedObservations();
    }, []);

    return (
        <MapContainer center={[13.08, 80.27]} zoom={7} style={{ height: 'calc(100vh - 60px)', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {observations.map(obs => (
                <Marker key={obs.id} position={[obs.location_lat, obs.location_lng]}>
                    <Popup>{obs.notes}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
