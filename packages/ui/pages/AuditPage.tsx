import {useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {Badge, Container, Pagination, Paper, SimpleGrid, Stack, Text, Title,} from "@mantine/core";
import {Loader} from "../components/Loader";
import {useUser} from "../context/UserContext";
import MultiFilter from "../components/MultiFilter";

const statusColors: Record<string, string> = {
    pending: "gray",
    in_progress: "blue",
    finished: "green",
    refused: "red",
};

const statusLabels: Record<string, string> = {
    pending: "En attente",
    in_progress: "En cours",
    finished: "Terminé",
    refused: "Refusé",
};


export default function AuditPage() {
    const {user} = useUser();
    const [audits, setAudits] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        axiosInstance
            .get("/audit/my-audits")
            .then((res) => {
                const all = [
                    ...(res.data.pending || []),
                    ...(res.data.in_progress || []),
                    ...(res.data.finished || []),
                ];
                setAudits(all);
                setFiltered(all);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedStatuses.length > 0) {
            setFiltered(audits.filter((a) => selectedStatuses.includes(a.status)));
        } else {
            setFiltered(audits);
        }
        setCurrentPage(1);
    }, [selectedStatuses, audits]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label,
    }));

    if (loading) return <Loader/>;

    return (
        <Container size="lg" py="lg">
            <Stack spacing="xl">
                <Title order={2}>Mes audits</Title>

                <Paper shadow="sm" p="lg" withBorder>
                    <Title order={4} mb="sm">Filtres par statut</Title>
                    <MultiFilter
                        label="Statut de l’audit"
                        placeholder="Filtrer par statut"
                        data={statusLabels}
                        value={selectedStatuses}
                        onChange={setSelectedStatuses}
                    />
                </Paper>

                <SimpleGrid cols={1} breakpoints={[{minWidth: 768, cols: 2}]} spacing="md">
                    {paginated.map((audit) => (
                        <Paper key={audit.id} shadow="sm" p="md" withBorder>
                            <Stack spacing="xs">
                                <Text fw={600}>
                                    Audit de <strong>{audit.company?.name}</strong>
                                </Text>
                                <Text size="sm">Date : {new Date(audit.audit_date).toLocaleDateString("fr-FR")}</Text>
                                <Badge color={statusColors[audit.status] || "gray"}>
                                    {statusLabels[audit.status] || audit.status}
                                </Badge>
                            </Stack>
                        </Paper>
                    ))}
                </SimpleGrid>

                {totalPages > 1 && (
                    <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={setCurrentPage}
                        position="center"
                    />
                )}
            </Stack>
        </Container>
    );
}
