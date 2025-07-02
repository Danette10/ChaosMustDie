import {Button, FileInput, Group, Modal, Radio, Stack, Textarea} from "@mantine/core";
import {useState} from "react";

/**
 * Props du composant EndAuditModal.
 *
 * @typedef {Object} EndAuditModalProps
 * @property {boolean} opened - Indique si la modal est ouverte.
 * @property {() => void} onClose - Fonction appelée pour fermer la modal.
 * @property {({ success: boolean; comment: string; reportFile: File }) => void} onSubmit - Fonction appelée lors de la soumission des données de l'audit.
 * @property {boolean} [loading=false] - Indique si le bouton de confirmation est en état de chargement (optionnel).
 */
type EndAuditModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: { success: boolean; comment: string; reportFile: File }) => void;
    loading?: boolean;
};

/**
 * Composant EndAuditModal.
 *
 * Ce composant affiche une modal permettant de terminer un audit. L'utilisateur peut indiquer
 * si l'audit a réussi ou échoué, ajouter un commentaire, et télécharger un rapport PDF.
 *
 * @param {EndAuditModalProps} props - Props du composant EndAuditModal.
 * @returns {JSX.Element} Le composant EndAuditModal.
 */
export default function EndAuditModal({opened, onClose, onSubmit, loading}: EndAuditModalProps) {
    const [success, setSuccess] = useState<boolean | null>(null); // État indiquant le résultat de l'audit (réussi ou échoué).
    const [comment, setComment] = useState(""); // État du commentaire saisi par l'utilisateur.
    const [file, setFile] = useState<File | null>(null); // État du fichier PDF téléchargé.

    /**
     * Vérifie si les données saisies sont valides.
     *
     * @type {boolean} Indique si les données saisies sont valides.
     */
    const isValid =
        success !== null &&
        (success
            ? file !== null
            : comment.trim().length > 0);

    /**
     * Fonction appelée lors de la confirmation.
     *
     * Cette fonction vérifie la validité des données saisies et appelle la fonction `onSubmit`
     * avec les données de l'audit.
     */
    const handleConfirm = () => {
        if (!isValid || (success && file === null)) return;

        onSubmit({success: !!success, comment, reportFile: file!});
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
                        <Radio value="success" label="Audit réussi"/>
                        <Radio value="fail" label="Audit échoué"/>
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