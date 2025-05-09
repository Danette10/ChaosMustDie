import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, Button, Container, Group, Paper, SimpleGrid, Stack, Title,} from "@mantine/core";

import axiosInstance from "../utils/axiosInstance";
import {useUser} from "../context/UserContext";
import {Loader} from "../components/Loader";
import {ContactAuditorModal} from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard";
import MultiFilter from "../components/MultiFilter";
import {AuditTypeLabels} from "../enum/AuditTypeEnum";

export default function DashboardPage() {
    const { user } = useUser();
    const navigate = useNavigate();

    const [auditors, setAuditors] = useState<any[]>([]);
    const [auditTypes, setAuditTypes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null);

    useEffect(() => {
        if (!user || user.user_type !== "company") {
            setLoading(false);
            return;
        }

        Promise.all([
            axiosInstance.get("/profile/auditors"),
            axiosInstance.get("/profile/audits"),
        ])
            .then(([auditorsRes, auditsRes]) => {
                setAuditors(auditorsRes.data);
                setAuditTypes(auditsRes.data.all);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const filteredAuditors = selectedTypes.length
        ? auditors.filter((auditor) =>
            selectedTypes.every((type) => auditor.audit_types.includes(type))
        )
        : auditors;

    const auditTypeOptions = Object.fromEntries(
        auditTypes.map((type) => [type, AuditTypeLabels[type] || type])
    );

    if (loading) return <Loader />;

    return (
        <Container size="lg" py="lg">
            <Stack spacing="xl">
                <Title order={2}>Bienvenue, {user?.first_name}</Title>

                {user?.user_type === "company" && (
                    <>
                        <Paper shadow="sm" p="lg" withBorder>
                            <Title order={4} mb="sm">Filtres par type d'audit</Title>
                            <MultiFilter
                                label="Filtres par type d'audit"
                                data={auditTypeOptions}
                                value={selectedTypes}
                                onChange={setSelectedTypes}
                            />
                        </Paper>

                        <Box>
                            <Group position="apart" mb="md">
                                <Title order={3}>Auditeurs disponibles</Title>
                                <Button onClick={() => navigate("/auditors")}>
                                    Voir tous les auditeurs
                                </Button>
                            </Group>

                            <SimpleGrid cols={1} breakpoints={[{ minWidth: 768, cols: 2 }]} spacing="md">
                                {filteredAuditors.slice(0, 5).map((auditor) => (
                                    <AuditorCard
                                        key={auditor.id}
                                        auditor={auditor}
                                        onContact={(auditor) => {
                                            setSelectedAuditor(auditor);
                                            setModalOpen(true);
                                        }}
                                    />
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
