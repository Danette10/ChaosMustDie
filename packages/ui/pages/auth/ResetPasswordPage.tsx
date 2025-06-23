import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
    Alert,
    Box,
    Button,
    Center,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Title
} from "@mantine/core";
import { BackButton } from "../../components/BackButton";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token) {
            setError("Token invalide ou manquant.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        try {
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
            <Paper shadow="md" radius="md" p="xl" style={{ width: "100%" }}>
                <Group justify="space-between" align="center" mb="md">
                    <BackButton />
                    <Title order={2} ta="center" m={0}>
                        Réinitialiser le mot de passe
                    </Title>
                    <Box />
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
