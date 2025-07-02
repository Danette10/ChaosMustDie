import {Container, Title} from "@mantine/core";
import {AuditList} from "ui/components/AuditList";

/**
 * Composant AuditListPage.
 *
 * Ce composant représente la page affichant la liste des audits de l'utilisateur.
 * Il inclut un titre et le composant `AuditList` qui gère l'affichage des audits.
 *
 * @returns {JSX.Element} Le composant AuditListPage.
 */
export default function AuditListPage() {
    return (
        <Container size="lg" py="lg">
            {/* Titre de la page */}
            <Title order={2}>Mes audits</Title>

            {/* Composant affichant la liste des audits */}
            <AuditList/>
        </Container>
    );
}