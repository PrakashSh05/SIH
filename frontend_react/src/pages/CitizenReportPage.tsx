import { Container, Title, Text} from '@mantine/core';
import CitizenReportForm from '../components/CitizenReportForm';
//import { notifications } from '@mantine/notifications';

export default function CitizenReportPage() {
    return (
        <Container size="sm" my={40}>
        
            <Title order={1} ta="center">Report an Ocean Hazard</Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl">
                Your contribution helps keep our coasts safe. Please provide details about your observation below.
            </Text>
            <CitizenReportForm />
        </Container>
    );
}