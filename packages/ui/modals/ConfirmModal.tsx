import { Modal, Button, Group, Stack, Title } from "@mantine/core";
import { ReactNode } from "react";

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
        <Modal opened={opened} onClose={onClose} title={<Title order={4}>{title}</Title>} centered>
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
