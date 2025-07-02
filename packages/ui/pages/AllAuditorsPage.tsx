import {useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {Box, Container, Pagination, Paper, SimpleGrid, Stack, Title,} from "@mantine/core";
import {Loader} from "../components/Loader";
import {useUser} from "../context/UserContext";
import {ContactAuditorModal} from "../modals/ContactAuditorModal";
import {AuditorCard} from "../components/AuditorCard";
import MultiFilter from "../components/MultiFilter";
import {AuditTypeLabels} from "../enum/AuditTypeEnum";

/**
 * Page AllAuditorsPage.
 *
 * Cette page affiche une liste paginée d'auditeurs, avec des options de filtrage par type d'audit.
 * Elle permet également de contacter un auditeur via une modal.
 *
 * @returns {JSX.Element} Le composant de la page AllAuditorsPage.
 */
export default function AllAuditorsPage() {
    const {user} = useUser(); // Récupère les informations de l'utilisateur depuis le contexte.
    const [auditors, setAuditors] = useState<any[]>([]); // État contenant la liste des auditeurs.
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // État des types d'audit sélectionnés pour le filtrage.
    const [auditTypes, setAuditTypes] = useState<string[]>([]); // État contenant tous les types d'audit disponibles.
    const [currentPage, setCurrentPage] = useState(1); // État de la page actuelle pour la pagination.
    const [loading, setLoading] = useState(true); // État indiquant si les données sont en cours de chargement.
    const [modalOpen, setModalOpen] = useState(false); // État indiquant si la modal de contact est ouverte.
    const [selectedAuditor, setSelectedAuditor] = useState<any>(null); // État contenant l'auditeur sélectionné pour la modal.
    const [companyPreferredTypes, setCompanyPreferredTypes] = useState<string[]>([]); // État des types d'audit préférés de l'entreprise.
    const itemsPerPage = 10; // Nombre d'éléments affichés par page.

    /**
     * Effet pour charger les données des auditeurs et des types d'audit.
     * Ce hook s'exécute lorsque l'utilisateur est une entreprise.
     */
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
                setAuditors((await auditorsRes).data); // Charge les auditeurs.
                setAuditTypes((await auditsRes).data.all); // Charge tous les types d'audit.
                setCompanyPreferredTypes((await auditsRes).data.selected); // Charge les types préférés.
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false); // Indique que le chargement est terminé.
            }
        };

        fetchData();
    }, [user]);

    /**
     * Effet pour réinitialiser la page actuelle lorsque les types d'audit sélectionnés changent.
     */
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTypes]);

    /**
     * Filtre les auditeurs en fonction des types d'audit préférés et sélectionnés.
     */
    const filteredAuditors = auditors
        .filter((a) => a.audit_types.some((type: string) => companyPreferredTypes.includes(type)))
        .filter((a) =>
            selectedTypes.length === 0
                ? true
                : a.audit_types.some((type: string) => selectedTypes.includes(type))
        );

    const totalPages = Math.ceil(filteredAuditors.length / itemsPerPage); // Calcule le nombre total de pages.
    const paginatedAuditors = filteredAuditors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ); // Découpe les auditeurs pour la pagination.

    const auditTypeOptions = Object.fromEntries(
        companyPreferredTypes.map((type) => [type, AuditTypeLabels[type as keyof typeof AuditTypeLabels] || type])
    ); // Crée les options de filtrage par type d'audit.

    if (loading) return <Loader/>; // Affiche un loader pendant le chargement.

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