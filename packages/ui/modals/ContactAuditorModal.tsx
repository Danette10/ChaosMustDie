import { useState } from "react";
import {
    Modal,
    Button,
    Textarea,
    TextInput,
    Group,
    Stack,
    Alert,
} from "@mantine/core";
import axiosInstance from "../utils/axiosInstance";

interface ContactAuditorModalProps {
    opened: boolean;
    onClose: () => void;
    auditorId: string;
    auditorName: string;
}

export const ContactAuditorModal = ({
                                        opened,
                                        onClose,
                                        auditorId,
                                        auditorName,
                                    }: ContactAuditorModalProps) => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSend = async () => {
        try {
            await axiosInstance.post("/audit/contact-auditor", {
                auditorId,
                subject,
                message,
            });
            setSuccess("Message envoyé avec succès ✅");
            setError("");
            setSubject("");
            setMessage("");
            setTimeout(onClose, 1500);
        } catch (err) {
            setError("Erreur lors de l'envoi du message ❌");
            setSuccess("");
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Contacter ${auditorName}`}
            centered
            keepMounted
            transitionProps={{
                transition: 'slide-up',
                duration: 250,
                timingFunction: 'ease',
            }}
        >
            <Stack>
                <TextInput
                    label="Objet"
                    placeholder="Ex : Demande de démarrage d’audit"
                    value={subject}
                    onChange={(e) => setSubject(e.currentTarget.value)}
                    required
                />
                <Textarea
                    label="Message"
                    placeholder="Bonjour, nous aimerions collaborer avec vous pour un audit..."
                    minRows={5}
                    value={message}
                    onChange={(e) => setMessage(e.currentTarget.value)}
                    required
                />
                {error && <Alert color="red">{error}</Alert>}
                {success && <Alert color="green">{success}</Alert>}
                <Group justify="end">
                    <Button onClick={handleSend}>Envoyer</Button>
                </Group>
            </Stack>
        </Modal>
    );
};
