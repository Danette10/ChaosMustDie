import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Box,
    Button,
    Paper,
    Alert,
    Text,
    Title,
    Center,
    PinInput,
    Group
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { BackButton } from "../components/BackButton";
import axiosInstance from "../utils/axiosInstance";

export default function ConfirmCode() {
    const [code, setCode] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await axiosInstance.post("/auth/confirm-code", { code });
            setSuccess("Compte confirmé avec succès");
            setError("");
            localStorage.removeItem("pending_confirmation_email");
            setTimeout(() => navigate("/login"), 1500);
        } catch {
            setError("Code invalide ou expiré");
            setSuccess("");
        } finally {
            setSubmitting(false);
        }
    };


    const handleResend = async () => {
        const email = localStorage.getItem("pending_confirmation_email");
        if (!email) {
            setError("Impossible de renvoyer le code : email introuvable");
            return;
        }

        try {
            await axiosInstance.post("/auth/resend-code", { email });
            setSuccess("Code renvoyé par email");
            setError("");
        } catch {
            setError("Erreur lors de l'envoi du code");
            setSuccess("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <Center h="100vh" px="md">
                <Paper w={360} p="lg" radius="md" shadow="sm">
                    <Group justify="space-between" align="center" mb="md">
                        <BackButton />
                        <Title order={3} m={0}>
                            Confirmation du compte
                        </Title>
                        <Box w={32} />
                    </Group>

                    {error && (
                        <Alert color="red" icon={<IconX size={16} />} mb="sm">
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert color="green" icon={<IconCheck size={16} />} mb="sm">
                            {success}
                        </Alert>
                    )}

                    <PinInput
                        length={6}
                        value={code}
                        onChange={setCode}
                        onComplete={handleConfirm}
                        type="alphanumeric"
                        inputMode="numeric"
                        oneTimeCode
                        autoFocus
                        size="lg"
                        mb="md"
                        disabled={submitting} // 🔐 désactivé pendant loading
                        style={{ display: "flex", justifyContent: "center", gap: 8 }}
                    />

                    <Button fullWidth onClick={handleConfirm} loading={submitting}>
                        Valider le code
                    </Button>


                    <Text size="sm" ta="center" mt="xs" mb="md">
                        Vous n'avez pas reçu le code ou il a expiré ?{" "}
                        <Button variant="subtle" size="xs" onClick={handleResend}>
                            Renvoyer le code
                        </Button>
                    </Text>
                </Paper>
            </Center>
        </motion.div>
    );
};
