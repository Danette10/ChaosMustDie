import {useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {Container, Pagination, Paper, SimpleGrid, Stack, Title,} from "@mantine/core";
import {Loader} from "../components/Loader";
import {useUser} from "../context/UserContext";
import {ContactAuditorModal} from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard";
import MultiFilter from "../components/MultiFilter";
import {AuditTypeLabels} from "../enum/AuditTypeEnum";

export default function AllAuditorsPage() {
    const { user } = useUser();
    const [auditors, setAuditors] = useState<any[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [auditTypes, setAuditTypes] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        if (user?.user_type !== "company") {
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
        ? auditors.filter((a) => selectedTypes.every((type) => a.audit_types.includes(type)))
        : auditors;

    const totalPages = Math.ceil(filteredAuditors.length / itemsPerPage);
    const paginatedAuditors = filteredAuditors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const auditTypeOptions = Object.fromEntries(
        auditTypes.map((type) => [type, AuditTypeLabels[type] || type])
    );

    if (loading) return <Loader />;

    return (
        <Container size="lg" py="lg">
            <Stack spacing="xl">
                <Title order={2}>Tous les auditeurs</Title>

                <Paper shadow="sm" p="lg" withBorder>
                    <Title order={4} mb="sm">Filtres par type d'audit</Title>
                    <MultiFilter
                        label="Filtres par type d'audit"
                        data={auditTypeOptions}
                        value={selectedTypes}
                        onChange={setSelectedTypes}
                    />
                </Paper>

                <SimpleGrid cols={1} breakpoints={[{ minWidth: 768, cols: 2 }]} spacing="md">
                    {paginatedAuditors.map((auditor) => (
                        <AuditorCard key={auditor.id} auditor={auditor} onContact={setSelectedAuditor}/>
                    ))}
                </SimpleGrid>

                {totalPages > 1 && (
                    <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={setCurrentPage}
                        position="center"
                        mt="md"
                        style={{ display: "flex", justifyContent: "center" }}
                    />
                )}

                <ContactAuditorModal
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    auditorId={selectedAuditor?.id || ""}
                    auditorName={selectedAuditor?.name || ""}
                />
            </Stack>
        </Container>
    );
}
