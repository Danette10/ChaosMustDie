import { Modal, Button, Textarea, Radio, FileInput, Stack, Text, Group } from "@mantine/core";
import { useState } from "react";

type EndAuditModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { success: boolean; comment: string; file: File | null }) => void;
    loading?: boolean;
};

export default function EndAuditModal({ opened, onClose, onSubmit, loading }: EndAuditModalProps) {
    const [success, setSuccess] = useState<boolean | null>(null);
    const [comment, setComment] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const isValid =
        success !== null &&
        (success
            ? file !== null
            : comment.trim().length > 0);

    const handleConfirm = () => {
        if (!isValid) return;
        onSubmit({ success: !!success, comment, file });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Terminer l'audit" centered>
            <Stack>
                <Radio.Group
                    label="Résultat de l'audit"
                    value={success !== null ? (success ? "success" : "fail") : ""}
                    onChange={(val) => setSuccess(val === "success")}
                >
                    <Group mt="xs" mb="xs">
                        <Radio value="success" label="Audit réussi" />
                        <Radio value="fail" label="Audit échoué" />
                    </Group>
                </Radio.Group>

                {success !== null && (
                    <Textarea
                        label={success ? "Message (optionnel)" : "Pourquoi l'audit a échoué ?"}
                        required={!success}
                        value={comment}
                        onChange={(e) => setComment(e.currentTarget.value)}
                    />
                )}

                {success && (
                    <FileInput
                        clearable
                        label="Rapport PDF"
                        placeholder="Télécharger le rapport PDF"
                        accept="application/pdf"
                        value={file}
                        onChange={setFile}
                    />
                )}

                <Button
                    onClick={handleConfirm}
                    disabled={!isValid}
                    loading={loading}
                >
                    Terminer l’audit
                </Button>
            </Stack>
        </Modal>
    );
}
