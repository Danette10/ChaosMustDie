import {useState} from "react";
import {Alert, Button, Group, Modal, Stack, Textarea,} from "@mantine/core";
import {useNavigate} from "react-router-dom";
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
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSend = async () => {
        try {
            const res = await axiosInstance.post("/chat/start", {
                auditor_id: auditorId,
                message,
            });

            const conversationId = res.data?.conversation_id;
            if (conversationId) {
                onClose();
                navigate(`/chat/${conversationId}`);
            } else {
                throw new Error("Conversation ID manquant");
            }
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création de la conversation");
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
                <Textarea
                    label="Message"
                    placeholder="Bonjour, nous aimerions collaborer avec vous pour un audit..."
                    minRows={5}
                    value={message}
                    onChange={(e) => setMessage(e.currentTarget.value)}
                    required
                />
                {error && <Alert color="red">{error}</Alert>}
                <Group justify="end">
                    <Button onClick={handleSend}>Envoyer</Button>
                </Group>
            </Stack>
        </Modal>
    );
};
