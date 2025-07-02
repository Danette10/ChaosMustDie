import {useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {Box, Container, Pagination, Paper, SimpleGrid, Stack, Title,} from "@mantine/core";
import {Loader} from "../components/Loader";
import {useUser} from "../context/UserContext";
import {ContactAuditorModal} from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard";
import MultiFilter from "../components/MultiFilter";
import {AuditTypeLabels} from "../enum/AuditTypeEnum";

export default function AllAuditorsPage() {
    const {user} = useUser();
    const [auditors, setAuditors] = useState<any[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [auditTypes, setAuditTypes] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null);
    const [companyPreferredTypes, setCompanyPreferredTypes] = useState<string[]>([]);
    const itemsPerPage = 10;

    useEffect(() => {
        if (user?.user_type !== "company") {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [auditorsRes, auditsRes] = await Promise.all([
                    axiosInstance.get("/profile/auditors"),
                    axiosInstance.get("/profile/audits"),
                ]);
                setAuditors((await auditorsRes).data);
                setAuditTypes((await auditsRes).data.all);
                setCompanyPreferredTypes((await auditsRes).data.selected);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTypes]);

    const filteredAuditors = auditors
        .filter((a) => a.audit_types.some((type: string) => companyPreferredTypes.includes(type)))
        .filter((a) =>
            selectedTypes.length === 0
                ? true
                : a.audit_types.some((type: string) => selectedTypes.includes(type))
        );

    const totalPages = Math.ceil(filteredAuditors.length / itemsPerPage);
    const paginatedAuditors = filteredAuditors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const auditTypeOptions = Object.fromEntries(
        companyPreferredTypes.map((type) => [type, AuditTypeLabels[type as keyof typeof AuditTypeLabels] || type])
    );

    if (loading) return <Loader/>;

    return (
        <Container size="lg" py="lg">
            <Stack gap="xl">
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

                <SimpleGrid cols={{base: 1, md: 2}} spacing="md">
                    {paginatedAuditors.map((auditor) => (
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

                {paginatedAuditors.length === 0 && (
                    <Title order={4} ta="center" c="dimmed">
                        Aucun auditeur ne correspond à vos critères.
                    </Title>
                )}

                {totalPages > 1 && (
                    <Box style={{display: "flex", justifyContent: "center"}}>
                        <Pagination
                            total={totalPages}
                            value={currentPage}
                            onChange={setCurrentPage}
                            mt="md"
                        />
                    </Box>
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
