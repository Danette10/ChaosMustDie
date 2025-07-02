import {Container, Title} from "@mantine/core";
import {AuditList} from "ui/components/AuditList";

export default function AuditListPage() {
    return (
        <Container size="lg" py="lg">
            <Title order={2}>Mes audits</Title>
            <AuditList/>
        </Container>
    );
}
