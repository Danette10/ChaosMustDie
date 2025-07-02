import {useUser} from "../context/UserContext";
import {useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {Alert, Box, Button, Checkbox, Container, Modal, Paper, PasswordInput, Stack, Text, Title} from "@mantine/core";
import {IconCheck, IconX} from "@tabler/icons-react";
import {Loader} from "../components/Loader";
import {UserTypeLabel} from "../enum/UserTypeEnum";
import {AuditTypeEnum, AuditTypeLabels} from "../enum/AuditTypeEnum";

/**
 * Composant ProfilePage.
 *
 * Ce composant affiche les informations du profil utilisateur, permet de modifier les préférences
 * de types d'audit et de changer le mot de passe. Il gère également les erreurs et les succès
 * lors des actions effectuées.
 *
 * @returns {JSX.Element} Le composant ProfilePage.
 */
export default function ProfilePage() {
    const {user} = useUser(); // Récupère les informations de l'utilisateur depuis le contexte.
    const [allAudits, setAllAudits] = useState<string[]>([]); // État contenant tous les types d'audit disponibles.
    const [selectedAudits, setSelectedAudits] = useState<string[]>([]); // État des types d'audit sélectionnés par l'utilisateur.
    const [success, setSuccess] = useState(""); // État du message de succès.
    const [error, setError] = useState(""); // État du message d'erreur.
    const [showAlert, setShowAlert] = useState(true); // État indiquant si les alertes doivent être affichées.
    const [loading, setLoading] = useState(true); // État indiquant si les données sont en cours de chargement.

    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false); // État indiquant si la modal de changement de mot de passe est ouverte.
    const [oldPassword, setOldPassword] = useState(""); // État de l'ancien mot de passe saisi.
    const [newPassword, setNewPassword] = useState(""); // État du nouveau mot de passe saisi.
    const [changePasswordError, setChangePasswordError] = useState(""); // État du message d'erreur lors du changement de mot de passe.

    /**
     * Effet pour charger les types d'audit disponibles et sélectionnés.
     * Ce hook s'exécute au montage du composant.
     */
    useEffect(() => {
        const fetchAudits = async () => {
            try {
                const res = await axiosInstance.get("/profile/audits");
                setAllAudits(res.data.all);
                setSelectedAudits(res.data.selected);
            } catch (err) {
                console.error("Erreur lors du chargement des audits :", err);
                setError("Erreur lors du chargement des types d'audit");
                setSuccess("");
            } finally {
                setLoading(false);
            }
        };

        fetchAudits();
    }, []);

    /**
     * Fonction pour basculer la sélection d'un type d'audit.
     *
     * @param {string} auditType - Le type d'audit à basculer.
     */
    const handleToggle = (auditType: string) => {
        setSelectedAudits((prev) =>
            prev.includes(auditType)
                ? prev.filter((a) => a !== auditType)
                : [...prev, auditType]
        );
    };

    /**
     * Fonction pour enregistrer les préférences de types d'audit.
     */
    const handleSave = async () => {
        try {
            await axiosInstance.post("/profile/audits", {selected: selectedAudits});
            setSuccess("Préférences enregistrées avec succès");
            setError("");
            setShowAlert(true);
        } catch (err) {
            console.error("Erreur lors de la sauvegarde :", err);
            setError("Erreur lors de l'enregistrement");
            setSuccess("");
            setShowAlert(true);
        }
    };

    /**
     * Fonction pour changer le mot de passe de l'utilisateur.
     */
    const handleChangePassword = async () => {
        try {
            await axiosInstance.post("/auth/change-password", {
                old_password: oldPassword,
                new_password: newPassword
            });
            setSuccess("Mot de passe changé avec succès");
            setError("");
            setChangePasswordModalOpen(false);
            setOldPassword("");
            setNewPassword("");
            setChangePasswordError("");
        } catch (err: any) {
            console.error("Erreur lors du changement de mot de passe :", err);
            if (err.response?.status === 401) {
                setChangePasswordError("L'ancien mot de passe est incorrect.");
            } else {
                setChangePasswordError("Erreur lors du changement de mot de passe.");
            }
        }
    };

    /**
     * Effet pour afficher les alertes de succès ou d'erreur pendant 5 secondes.
     */
    useEffect(() => {
        if (success || error) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    if (loading) return <Loader/>; // Affiche un loader pendant le chargement.

    return (
        <Container size="sm" p="md">
            <Paper p="lg" radius="md" shadow="sm">
                <Title order={2} mb="xs">Profil</Title>
                {error && showAlert && (
                    <Alert color="red" icon={<IconX size={16}/>} mb="sm">
                        {error}
                    </Alert>
                )}
                {success && showAlert && (
                    <Alert color="green" icon={<IconCheck size={16}/>} mb="sm">
                        {success}
                    </Alert>
                )}
                <Box>
                    <Title order={3} mb="xs" ta="center">Informations utilisateur</Title>
                    <Text mb="xs"><strong>Nom :</strong> {user?.lastname}</Text>
                    <Text mb="xs"><strong>Prénom :</strong> {user?.firstname}</Text>
                    <Text mb="xs"><strong>Email :</strong> {user?.email}</Text>
                    <Text mb="xs"><strong>Type d'utilisateur :</strong> {user && UserTypeLabel[user.user_type]}</Text>
                    <Stack mt="md">
                        <Button onClick={() => {
                            setChangePasswordModalOpen(true);
                            setChangePasswordError("");
                            setOldPassword("");
                            setNewPassword("");
                        }}>
                            Changer le mot de passe
                        </Button>
                        {user?.user_type === "company" && (
                            <Button
                                color="red"
                                onClick={async () => {
                                    try {
                                        const res = await axiosInstance.post("/auth/reset-unique-password");
                                        setSuccess(res.data.message);
                                        setError("");
                                    } catch (err) {
                                        console.error("Erreur lors de la réinitialisation du mot de passe :", err);
                                        setError("Échec de la réinitialisation du mot de passe");
                                        setSuccess("");
                                    }
                                }}
                            >
                                Réinitialiser le mot de passe unique
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Box>
                    <Title order={3} mt="md" mb="xs" ta="center">Types d'audit souhaités</Title>
                    <Stack gap="xs">
                        {allAudits.map((type) => (
                            <Checkbox
                                key={type}
                                label={AuditTypeLabels[type as AuditTypeEnum] || type}
                                checked={selectedAudits.includes(type)}
                                onChange={() => handleToggle(type)}
                            />
                        ))}
                    </Stack>
                    <Button fullWidth mt="lg" onClick={handleSave}>
                        Enregistrer
                    </Button>
                </Box>
            </Paper>

            <Modal
                opened={changePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
                title="Changer le mot de passe"
                centered
            >
                <Stack>
                    <PasswordInput
                        label="Ancien mot de passe"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.currentTarget.value)}
                    />
                    <PasswordInput
                        label="Nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.currentTarget.value)}
                    />
                    {changePasswordError && (
                        <Alert color="red" icon={<IconX size={16}/>} mb="sm">
                            {changePasswordError}
                        </Alert>
                    )}
                    <Button onClick={handleChangePassword}>Valider</Button>
                </Stack>
            </Modal>
        </Container>
    );
};