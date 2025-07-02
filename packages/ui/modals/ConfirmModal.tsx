import {Button, Group, Modal, Stack} from "@mantine/core";
import {ReactNode} from "react";

/**
 * Props du composant ConfirmModal.
 *
 * @typedef {Object} ConfirmModalProps
 * @property {boolean} opened - Indique si la modal est ouverte.
 * @property {() => void} onClose - Fonction appelée pour fermer la modal.
 * @property {() => void} onConfirm - Fonction appelée lors de la confirmation.
 * @property {string} [title="Confirmation"] - Titre de la modal (optionnel).
 * @property {ReactNode} [children] - Contenu affiché dans la modal (optionnel).
 * @property {string} [confirmLabel="Confirmer"] - Texte du bouton de confirmation (optionnel).
 * @property {string} [cancelLabel="Annuler"] - Texte du bouton d'annulation (optionnel).
 * @property {boolean} [loading=false] - Indique si le bouton de confirmation est en état de chargement (optionnel).
 */
interface ConfirmModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    children?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

/**
 * Composant ConfirmModal.
 *
 * Ce composant affiche une modal de confirmation avec un titre, un contenu personnalisé,
 * et deux boutons pour confirmer ou annuler l'action.
 *
 * @param {ConfirmModalProps} props - Props du composant ConfirmModal.
 * @returns {JSX.Element} Le composant ConfirmModal.
 */
export default function ConfirmModal({
                                         opened,
                                         onClose,
                                         onConfirm,
                                         title = "Confirmation",
                                         children,
                                         confirmLabel = "Confirmer",
                                         cancelLabel = "Annuler",
                                         loading = false,
                                     }: ConfirmModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title={title} centered>
            <Stack>
                {children}

                <Group grow mt="md">
                    <Button variant="default" onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button color="red" onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}