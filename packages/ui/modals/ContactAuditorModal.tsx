import {useState} from "react";
import {Alert, Button, Group, Modal, Stack, Textarea} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

/**
 * Props du composant ContactAuditorModal.
 *
 * @typedef {Object} ContactAuditorModalProps
 * @property {boolean} opened - Indique si la modal est ouverte.
 * @property {() => void} onClose - Fonction appelée pour fermer la modal.
 * @property {string} auditorId - Identifiant de l'auditeur à contacter.
 * @property {string} auditorName - Nom de l'auditeur à afficher dans le titre de la modal.
 */
interface ContactAuditorModalProps {
    opened: boolean;
    onClose: () => void;
    auditorId: string;
    auditorName: string;
}

/**
 * Composant ContactAuditorModal.
 *
 * Ce composant affiche une modal permettant à l'utilisateur d'envoyer un message à un auditeur.
 * Il gère l'état du message, les erreurs et la navigation vers une conversation après l'envoi.
 *
 * @param {ContactAuditorModalProps} props - Props du composant ContactAuditorModal.
 * @returns {JSX.Element} Le composant ContactAuditorModal.
 */
export const ContactAuditorModal = ({
                                        opened,
                                        onClose,
                                        auditorId,
                                        auditorName,
                                    }: ContactAuditorModalProps) => {
    const [message, setMessage] = useState(""); // État du message saisi par l'utilisateur.
    const [error, setError] = useState(""); // État des erreurs lors de l'envoi du message.
    const navigate = useNavigate(); // Hook pour naviguer vers une autre page.

    /**
     * Fonction pour gérer l'envoi du message.
     *
     * Cette fonction envoie une requête au serveur pour démarrer une conversation avec l'auditeur.
     * En cas de succès, elle redirige l'utilisateur vers la page de conversation.
     * En cas d'échec, elle affiche une erreur.
     */
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