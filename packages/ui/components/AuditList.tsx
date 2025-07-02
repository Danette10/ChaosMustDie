import {useEffect, useState} from "react";
import {
    Badge,
    Pagination,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useComputedColorScheme,
    useMantineTheme
} from "@mantine/core";
import axiosInstance from "../utils/axiosInstance";
import {useUser} from "../context/UserContext";
import {Loader} from "./Loader";
import {useNavigate} from "react-router-dom";
import MultiFilter from "./MultiFilter";
import {statusColors, statusLabels} from "../constants/auditStatus";
import {formatDateTimeFR} from "../utils/dateUtils";

/**
 * Props for the AuditList component.
 *
 * @interface AuditListProps
 * @property {number} [limit] - Maximum number of audits to display.
 * @property {string[]} [statusFilter] - Array of statuses to filter audits.
 */
interface AuditListProps {
    limit?: number;
    statusFilter?: string[];
}

/**
 * AuditList Component
 *
 * This component displays a list of audits with filtering, pagination, and dynamic styling.
 * It fetches audit data from the server and allows users to interact with individual audits based on their status.
 *
 * @param {AuditListProps} props - Props for the component.
 * @returns {JSX.Element} The rendered audit list.
 */
export function AuditList({limit, statusFilter}: AuditListProps) {
    const {user} = useUser(); // Retrieves the current user context.
    const navigate = useNavigate(); // Navigation hook for routing.
    const theme = useMantineTheme(); // Mantine theme object for styling.
    const colorScheme = useComputedColorScheme(); // Detects the current color scheme (light/dark).
    const isDark = colorScheme === "dark"; // Boolean indicating if the theme is dark.

    const [audits, setAudits] = useState<any[]>([]); // State for storing all audits.
    const [filtered, setFiltered] = useState<any[]>([]); // State for storing filtered audits.
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]); // State for selected statuses in the filter.
    const [loading, setLoading] = useState(true); // State for loading indicator.
    const [currentPage, setCurrentPage] = useState(1); // State for current page in pagination.
    const itemsPerPage = 10; // Number of items per page.

    /**
     * Fetches audits from the server and updates the state.
     * Runs once when the component is mounted.
     */
    useEffect(() => {
        const fetchAudits = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get("/audit/my-audits");
                const all = [
                    ...(res.data.pending || []),
                    ...(res.data.in_progress || []),
                    ...(res.data.completed || []),
                    ...(res.data.failed || []),
                ];
                setAudits(all);
                setFiltered(all);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAudits();
    }, []);

    /**
     * Filters audits based on selected statuses and props.
     * Updates the filtered audits whenever dependencies change.
     */
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

    const finalList = limit ? filtered.slice(0, limit) : filtered; // Applies limit to the filtered audits.
    const paginated = finalList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // Paginates the audits.
    const totalPages = Math.ceil(finalList.length / itemsPerPage); // Calculates total pages for pagination.

    // Displays a loader while data is being fetched.
    if (loading) return <Loader/>;

    return (
        <Stack gap="xl">
            {/* Filter section for audit statuses */}
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

            {/* Grid displaying audits */}
            <SimpleGrid cols={{base: 1, md: 2}} spacing="md">
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
                            <Stack gap="xs">
                                <Text fw={600}>
                                    Audit de{" "}
                                    <strong>
                                        {user?.user_type === "company"
                                            ? `${audit.auditor?.firstname} ${audit.auditor?.lastname}`
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

            {/* Pagination controls */}
            {!limit && totalPages > 1 && (
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={setCurrentPage}
                    />
                </div>
            )}
        </Stack>
    );
}