import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
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
    Pagination,
    Title,
} from "@mantine/core";
import { Loader } from "../components/Loader";
import { useUser } from "../context/UserContext";
import { ContactAuditorModal } from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard";

export default function AllAuditorsPage() {
    const { user } = useUser();
    const [auditors, setAuditors] = useState([]);
    const [auditTypes, setAuditTypes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null);
    const itemsPerPage = 10;

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

    const filteredAuditors = selectedTypes.length > 0
        ? auditors.filter((auditor) =>
            selectedTypes.every((type) => auditor.audit_types.includes(type))
        )
        : auditors;

    const totalPages = Math.ceil(filteredAuditors.length / itemsPerPage);
    const paginatedAuditors = filteredAuditors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <Loader />;

    return (
        <Container size="lg" py="lg">
            <Stack spacing="xl">
                <Title order={2}>Tous les auditeurs</Title>

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

                <SimpleGrid cols={1} breakpoints={[{ minWidth: 768, cols: 2 }]} spacing="md">
                    {paginatedAuditors.map((auditor) => (
                        <AuditorCard key={auditor.id} auditor={auditor} onContact={openContactModal} />
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
