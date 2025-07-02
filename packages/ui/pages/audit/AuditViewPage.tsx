import {Badge, Box, Button, Loader, Paper, Stack, Text, Title} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosInstance from "../../utils/axiosInstance";
import {useUser} from "ui/context/UserContext";
import {statusColors, statusLabels} from "ui/constants/auditStatus";
import {formatDateTimeFR} from "ui/utils/dateUtils";

/**
 * Composant AuditViewPage.
 *
 * Ce composant affiche les détails d'un audit spécifique, y compris les informations sur l'entreprise auditée
 * ou l'auditeur, la date de l'audit, le statut, et un commentaire. Il permet également de télécharger un rapport
 * PDF si disponible et autorisé.
 *
 * @returns {JSX.Element} Le composant AuditViewPage.
 */
export function AuditViewPage() {
    const {id} = useParams(); // Récupère l'ID de l'audit depuis les paramètres de l'URL.
    const {user} = useUser(); // Récupère les informations de l'utilisateur depuis le contexte.
    const [audit, setAudit] = useState<any | null>(null); // État pour stocker les données de l'audit.
    const [loading, setLoading] = useState(true); // État pour indiquer si les données sont en cours de chargement.

    /**
     * Effet pour récupérer les détails de l'audit depuis l'API.
     * Exécuté lorsque l'ID de l'audit change.
     */
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

    // Affiche un loader pendant le chargement des données.
    if (loading) return <Loader/>;
    // Affiche un message d'erreur si l'audit est introuvable.
    if (!audit) return <Text c="red">Audit introuvable</Text>;

    const isAuditor = user?.user_type === "auditor"; // Vérifie si l'utilisateur est un auditeur.
    const isCompany = user?.user_type === "company"; // Vérifie si l'utilisateur est une entreprise.

    /**
     * Vérifie si l'utilisateur peut télécharger le rapport PDF.
     * Les auditeurs peuvent télécharger si l'audit leur appartient.
     * Les entreprises peuvent télécharger si l'audit leur appartient.
     */
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