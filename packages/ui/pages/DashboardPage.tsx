import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, Button, Container, Group, Paper, SimpleGrid, Stack, Title} from "@mantine/core";
import axiosInstance from "../utils/axiosInstance";
import {useUser} from "../context/UserContext";
import {Loader} from "../components/Loader";
import {ContactAuditorModal} from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard";
import MultiFilter from "../components/MultiFilter";
import {AuditTypeLabels} from "../enum/AuditTypeEnum";
import {AuditList} from "../components/AuditList";

/**
 * Composant DashboardPage.
 *
 * Ce composant représente la page d'accueil du tableau de bord. Il affiche des informations
 * personnalisées en fonction du type d'utilisateur (entreprise ou auditeur).
 * Les entreprises peuvent voir une liste d'auditeurs disponibles et filtrer par type d'audit.
 * Les auditeurs peuvent voir une liste de leurs audits en cours.
 *
 * @returns {JSX.Element} Le composant DashboardPage.
 */
export default function DashboardPage() {
    const {user} = useUser(); // Récupère les informations de l'utilisateur depuis le contexte.
    const navigate = useNavigate(); // Hook pour naviguer entre les pages.

    const [auditors, setAuditors] = useState<any[]>([]); // État contenant la liste des auditeurs.
    const [auditTypes, setAuditTypes] = useState<string[]>([]); // État contenant les types d'audit disponibles.
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // État des types d'audit sélectionnés pour le filtrage.
    const [loading, setLoading] = useState(true); // État indiquant si les données sont en cours de chargement.
    const [modalOpen, setModalOpen] = useState(false); // État indiquant si la modal de contact est ouverte.
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null); // État contenant l'auditeur sélectionné pour la modal.
    const [, setAudits] = useState<any[]>([]); // État contenant la liste des audits en cours.

    /**
     * Effet pour charger les données des auditeurs et des audits en fonction du type d'utilisateur.
     * Ce hook s'exécute lorsque l'utilisateur est connecté.
     */
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                if (user.user_type === "company") {
                    const [auditorsRes, auditsRes] = await Promise.all([
                        axiosInstance.get("/profile/auditors"),
                        axiosInstance.get("/profile/audits"),
                    ]);
                    setAuditors((await auditorsRes).data); // Charge les auditeurs disponibles.
                    setAuditTypes((await auditsRes).data.all); // Charge les types d'audit disponibles.
                }

                if (user.user_type === "auditor") {
                    const res = await axiosInstance.get("/audit/my-audits");
                    const inProgress = res.data.in_progress || [];
                    setAudits(inProgress); // Charge les audits en cours.
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false); // Indique que le chargement est terminé.
            }
        };

        fetchData();
    }, [user]);

    /**
     * Filtre les auditeurs en fonction des types d'audit sélectionnés.
     * Si aucun type n'est sélectionné, retourne tous les auditeurs.
     */
    const filteredAuditors = selectedTypes.length
        ? auditors.filter((auditor) =>
            selectedTypes.every((type) => auditor.audit_types.includes(type))
        )
        : auditors;

    /**
     * Crée les options de filtrage par type d'audit.
     * Associe chaque type d'audit à son label.
     */
    const auditTypeOptions = Object.fromEntries(
        auditTypes.map((type) => [type, AuditTypeLabels[type as keyof typeof AuditTypeLabels] || type])
    );

    if (loading) return <Loader/>; // Affiche un loader pendant le chargement.

    return (
        <Container size="lg" py="lg">
            <Stack gap="xl">
                <Title order={2}>Bienvenue, {user?.firstname}</Title>

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
                            <Group justify="space-between" mb="md">
                                <Title order={3}>Auditeurs disponibles</Title>
                                <Button onClick={() => navigate("/auditors")}>
                                    Voir tous les auditeurs
                                </Button>
                            </Group>

                            <SimpleGrid cols={{base: 1, md: 2}} spacing="md">
                                {filteredAuditors.slice(0, 5).map((auditor) => (
                                    <AuditorCard
                                        key={auditor.id}
                                        auditor={auditor}
                                        onContact={(a) => {
                                            setSelectedAuditor(a);
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

                {user?.user_type === "auditor" && (
                    <>
                        <Group justify="space-between" mb="md">
                            <Title order={2}>Audits en cours</Title>
                            <Button mt="md" onClick={() => navigate("/audit")}>
                                Voir tous les audits
                            </Button>
                        </Group>
                        <AuditList
                            limit={5}
                            statusFilter={["in_progress"]}/>
                    </>
                )}

            </Stack>
        </Container>
    );
}