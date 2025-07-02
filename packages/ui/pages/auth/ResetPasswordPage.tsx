import {useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {Alert, Box, Button, Center, Group, Paper, PasswordInput, Stack, Title} from "@mantine/core";
import {BackButton} from "ui/components/BackButton";

/**
 * Composant ResetPasswordPage.
 *
 * Ce composant permet à l'utilisateur de réinitialiser son mot de passe en saisissant un nouveau mot de passe
 * et en le confirmant. Il vérifie la validité du token de réinitialisation et gère les erreurs ou succès
 * lors de la soumission.
 *
 * @returns {JSX.Element} Le composant ResetPasswordPage.
 */
export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams(); // Récupère les paramètres de recherche de l'URL.
    const token = searchParams.get("token"); // Extrait le token de réinitialisation depuis les paramètres.
    const navigate = useNavigate(); // Hook pour naviguer entre les pages.

    const [newPassword, setNewPassword] = useState(""); // État pour le nouveau mot de passe.
    const [confirmPassword, setConfirmPassword] = useState(""); // État pour la confirmation du mot de passe.
    const [error, setError] = useState(""); // État pour afficher un message d'erreur.
    const [success, setSuccess] = useState(""); // État pour afficher un message de succès.

    /**
     * Fonction pour gérer la soumission du formulaire de réinitialisation.
     *
     * @param {React.FormEvent} e - Événement de soumission du formulaire.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Vérifie si le token est valide.
        if (!token) {
            setError("Token invalide ou manquant.");
            return;
        }

        // Vérifie si les mots de passe correspondent.
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // Vérifie la longueur du mot de passe.
        if (newPassword.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        try {
            // Envoie une requête à l'API pour réinitialiser le mot de passe.
            await axiosInstance.post("/auth/reset-password", {
                token,
                new_password: newPassword
            });
            setSuccess("Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la réinitialisation.");
        }
    };

    return (
        <Center h="100vh" px="md">
            <Paper shadow="md" radius="md" p="xl" style={{width: "100%"}}>
                <Group justify="space-between" align="center" mb="md">
                    <BackButton/>
                    <Title order={2} ta="center" m={0}>
                        Réinitialiser le mot de passe
                    </Title>
                    <Box/>
                </Group>

                {success && (
                    <Alert color="green" mb="sm">
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert color="red" mb="sm">
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack>
                        <PasswordInput
                            label="Nouveau mot de passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.currentTarget.value)}
                            required
                        />

                        <PasswordInput
                            label="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                            required
                        />

                        <Button type="submit" fullWidth>
                            Réinitialiser
                        </Button>
                    </Stack>
                </form>

                {success && (
                    <Button variant="light" mt="md" fullWidth onClick={() => navigate("/login")}>
                        Retour à la connexion
                    </Button>
                )}
            </Paper>
        </Center>
    );
}