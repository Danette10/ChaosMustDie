import {useEffect, useState} from "react";
import {
    Badge,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useComputedColorScheme,
    useMantineTheme,
    Pagination
} from "@mantine/core";
import axiosInstance from "../utils/axiosInstance";
import {useUser} from "../context/UserContext";
import {Loader} from "./Loader";
import {useNavigate} from "react-router-dom";
import MultiFilter from "./MultiFilter";
import { statusLabels, statusColors } from "../constants/auditStatus";
import {formatDateTimeFR} from "../utils/dateUtils";

interface AuditListProps {
    limit?: number;
    statusFilter?: string[];
}

export function AuditList({ limit, statusFilter }: AuditListProps) {
    const { user } = useUser();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";

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
                    ...(res.data.completed || []),
                    ...(res.data.failed || []),
                ];
                setAudits(all);
                setFiltered(all);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let base = [...audits];

        if (statusFilter && statusFilter.length > 0) {
            base = base.filter((a) => statusFilter.includes(a.status));
        }

        if (selectedStatuses.length > 0) {
            base = base.filter((a) => selectedStatuses.includes(a.status));
        }

        setFiltered(base);
        setCurrentPage(1);
    }, [selectedStatuses, audits, statusFilter]);

    const finalList = limit ? filtered.slice(0, limit) : filtered;
    const paginated = finalList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(finalList.length / itemsPerPage);

    if (loading) return <Loader />;

    return (
        <Stack spacing="xl">

            {!limit && (
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
            )}

            <SimpleGrid cols={1} breakpoints={[{ minWidth: 768, cols: 2 }]} spacing="md">
                {paginated.map((audit) => {
                    const isAuditor = user?.user_type === "auditor";
                    const isCompany = user?.user_type === "company";
                    const clickable =
                        (isAuditor && audit.status !== "pending") ||
                        (isCompany && ["completed", "failed"].includes(audit.status));
                return (
                    <Paper
                        key={audit.id}
                        shadow="sm"
                        p="md"
                        withBorder
                        style={{
                            cursor: clickable ? "pointer" : "default",
                        }}
                        onClick={() => {
                            if (["completed", "failed"].includes(audit.status)) {
                                navigate(`/audit/view/${audit.id}`);
                            } else if (isAuditor && audit.status !== "pending") {
                                navigate(`/audit/start/${audit.id}`);
                            }
                        }}
                        onMouseEnter={(e) => {
                            if (clickable) {
                                e.currentTarget.style.backgroundColor = isDark
                                    ? theme.colors.dark[5]
                                    : theme.colors.gray[0];
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (clickable) {
                                e.currentTarget.style.backgroundColor = isDark
                                    ? theme.colors.dark[7]
                                    : theme.white;
                            }
                        }}
                    >
                        <Stack spacing="xs">
                            <Text fw={600}>
                                Audit de{" "}
                                <strong>
                                    {user?.user_type === "company"
                                        ? `${audit.auditor?.first_name} ${audit.auditor?.last_name}`
                                        : audit.company?.name}
                                </strong>
                            </Text>
                            <Text size="sm">Date : {formatDateTimeFR(audit.audit_date)}</Text>
                            <Badge color={statusColors[audit.status] || "gray"}>
                                {statusLabels[audit.status] || audit.status}
                            </Badge>
                        </Stack>
                    </Paper>
                );
                })}
            </SimpleGrid>

            {!limit && totalPages > 1 && (
                <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    position="center"
                />
            )}
        </Stack>
    );
}
