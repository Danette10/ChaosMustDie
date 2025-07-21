import React, {useState} from "react";
import axiosInstance from "../../utils/axiosInstance";
import {Alert, Box, Button, Center, Group, Paper, Stack, TextInput, Title} from "@mantine/core";
import {BackButton} from "ui/components/BackButton";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            await axiosInstance.post("/auth/forgot-password", {email});
            setSuccess("Si cet email existe, un lien de réinitialisation a été envoyé.");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la demande.");
        }
    };

    return (
        <Center h="100vh" px="md">
            <Paper shadow="md" radius="md" p="xl" style={{width: "100%"}}>
                <Group justify="space-between" align="center" mb="md">
                    <BackButton/>
                    <Title order={2} ta="center" m={0}>
                        Mot de passe oublié
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
                        <TextInput
                            label="Email"
                            placeholder="Votre email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            required
                        />

                        <Button type="submit" fullWidth>
                            Envoyer la demande
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Center>
    );
}

