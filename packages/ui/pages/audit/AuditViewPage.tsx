import {Badge, Box, Button, Loader, Paper, Stack, Text, Title} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosInstance from "../../utils/axiosInstance";
import {useUser} from "ui/context/UserContext";
import {statusColors, statusLabels} from "ui/constants/auditStatus";
import {formatDateTimeFR} from "ui/utils/dateUtils";

export function AuditViewPage() {
    const {id} = useParams();
    const {user} = useUser();
    const [audit, setAudit] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await axiosInstance.get(`/audit/${id}`);
                setAudit(res.data);
            } catch (err) {
                console.error("Erreur lors du chargement de l'audit :", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAudit();
        }
    }, [id]);

    if (loading) return <Loader/>;
    if (!audit) return <Text c="red">Audit introuvable</Text>;

    const isAuditor = user?.user_type === "auditor";
    const isCompany = user?.user_type === "company";

    const canDownload =
        audit.file_path &&
        ((isAuditor && user.id === audit.auditor.id) ||
            (isCompany && user.id === audit.company.user_id));

    return (
        <Box p="md">
            <Paper shadow="md" p="lg" withBorder>
                <Stack gap="md">
                    <Title order={3}>Détail de l’audit</Title>

                    <Text>
                        <strong>{isAuditor ? "Entreprise auditée" : "Audit réalisé par"} :</strong>{" "}
                        {isAuditor
                            ? audit.company.name
                            : `${audit.auditor.firstname} ${audit.auditor.lastname}`}
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
                        <br/>
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
                        <Text c="red">Aucun rapport PDF disponible</Text>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}
