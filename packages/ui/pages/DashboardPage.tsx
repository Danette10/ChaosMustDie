import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Loader } from "../components/Loader";
import {
    Badge,
    Box,
    Button,
    Container,
    Group,
    MultiSelect,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title
} from "@mantine/core";
import { ContactAuditorModal } from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard"; // ← Import du modal

export default function DashboardPage() {
    const { user } = useUser();
    const [auditors, setAuditors] = useState([]);
    const [auditTypes, setAuditTypes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null);

    useEffect(() => {
        if (user === undefined) return;

        if (user?.user_type === "company") {
            Promise.all([
                axiosInstance.get("/profile/auditors"),
                axiosInstance.get("/profile/audits")
            ])
                .then(([auditorsRes, auditsRes]) => {
                    setAuditors(auditorsRes.data);
                    setAuditTypes(auditsRes.data.all);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const filteredAuditors =
        selectedTypes.length > 0
            ? auditors.filter((auditor) =>
                selectedTypes.every((type) => auditor.audit_types.includes(type))
            )
            : auditors;

    const getBadgeColor = (type: string) => {
        switch (type) {
            case "SQLI": return "red";
            case "DDOS": return "orange";
            case "BRUTEFORCE": return "blue";
            case "WEB_TECHNOLOGIES": return "green";
            case "ENDPOINT_DISCOVERY": return "grape";
            case "XSS": return "violet";
            case "HTTP_HEADER_IDENTIFICATION": return "cyan";
            default: return "gray";
        }
    };

    const openContactModal = (auditor: any) => {
        setSelectedAuditor(auditor);
        setModalOpen(true);
    };

    if (loading) return <Loader />;

    return (
        <Container size="lg" py="lg">
            <Stack spacing="xl">
                <Box>
                    <Title order={2}>Bienvenue, {user?.first_name}</Title>
                </Box>

                {user?.user_type === "company" && (
                    <>
                        <Paper shadow="sm" p="lg" withBorder>
                            <Title order={4} mb="sm">Filtres par type d'audit</Title>
                            <MultiSelect
                                label="Filtres par type d'audit"
                                placeholder="Sélectionner un ou plusieurs types"
                                data={auditTypes}
                                value={selectedTypes}
                                onChange={setSelectedTypes}
                                searchable
                                clearable
                                nothingFoundMessage="Aucun type trouvé"
                            />
                        </Paper>

                        <Box>
                            <Group position="apart" mb="md">
                                <Title order={3}>Auditeurs disponibles</Title>
                                <Button variant="filled" onClick={() => navigate("/auditors")}>Voir tous les auditeurs</Button>
                            </Group>

                            <SimpleGrid cols={1} breakpoints={[{ minWidth: 768, cols: 2 }]} spacing="md">
                                {filteredAuditors.slice(0, 5).map((auditor) => (
                                    <AuditorCard key={auditor.id} auditor={auditor} onContact={openContactModal} />
                                ))}
                            </SimpleGrid>
                        </Box>

                        <ContactAuditorModal
                            opened={modalOpen}
                            onClose={() => setModalOpen(false)}
                            auditorId={selectedAuditor?.id || ""}
                            auditorName={selectedAuditor?.name || ""}
                        />

                    </>
                )}
            </Stack>
        </Container>
    );
}
