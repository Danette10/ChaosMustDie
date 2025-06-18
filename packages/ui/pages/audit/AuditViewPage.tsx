import {
    Badge,
    Box,
    Button,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
    useComputedColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useUser } from "../../context/UserContext";
import { statusLabels, statusColors } from "../../constants/auditStatus";
import {formatDateTimeFR} from "../../utils/dateUtils";

export function AuditViewPage() {
    const { id } = useParams();
    const { user } = useUser();
    const [audit, setAudit] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";

    useEffect(() => {
        axiosInstance
            .get(`/audit/${id}`)
            .then((res) => setAudit(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loader />;
    if (!audit) return <Text color="red">Audit introuvable</Text>;

    const isAuditor = user?.user_type === "auditor";
    const isCompany = user?.user_type === "company";

    const canDownload =
        audit.file_path &&
        ((isAuditor && user.id === audit.auditor.id) ||
            (isCompany && user.id === audit.company.user_id));

    return (
        <Box p="md">
            <Paper shadow="md" p="lg" withBorder>
                <Stack spacing="md">
                    <Title order={3}>Détail de l’audit</Title>

                    <Text>
                        <strong>{isAuditor ? "Entreprise auditée" : "Audit réalisé par"} :</strong>{" "}
                        {isAuditor
                            ? audit.company.name
                            : `${audit.auditor.first_name} ${audit.auditor.last_name}`}
                    </Text>

                    <Text>
                        <strong>Date :</strong>{" "}
                        {formatDateTimeFR(audit.audit_date)}
                    </Text>

                    <Badge color={statusColors[audit.status]} size="lg">
                        {statusLabels[audit.status] || audit.status}
                    </Badge>

                    <Text>
                        <strong>Commentaire de l’auditeur :</strong>
                        <br />
                        {audit.comment || <em>Aucun commentaire fourni.</em>}
                    </Text>

                    {canDownload ? (
                        <Button
                            onClick={async () => {
                                try {
                                    const response = await axiosInstance.get(
                                        `/reports/download/${audit.id}`,
                                        {
                                            responseType: "blob",
                                        }
                                    );
                                    const blob = new Blob([response.data], {
                                        type: "application/pdf",
                                    });
                                    const url = window.URL.createObjectURL(blob);
                                    window.open(url, "_blank");
                                    setTimeout(() => {
                                        window.URL.revokeObjectURL(url);
                                    }, 5000);
                                } catch (err) {
                                    console.error("Erreur lors du téléchargement", err);
                                }
                            }}
                            variant="outline"
                        >
                            Télécharger le rapport
                        </Button>
                    ) : (
                        <Text color="red">Aucun rapport PDF disponible</Text>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}
