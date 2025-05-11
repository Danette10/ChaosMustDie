import {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import {
    Alert,
    Button,
    Container, Divider, FileInput,
    Group,
    Loader,
    MultiSelect,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import axiosInstance from "../../utils/axiosInstance";
import {useUser} from "../../context/UserContext";
import {auditFieldConfig} from "../../utils/auditConfig";
import ConfirmModal from "../../modals/ConfirmModal";

export default function StartAuditPage() {
    const {auditId} = useParams();
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [uniquePassword, setUniquePassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    const [extraParams, setExtraParams] = useState<Record<string, any>>({});
    const [auditStatus, setAuditStatus] = useState<Record<string, "pending" | "success" | "error">>({});
    const [reportUrl, setReportUrl] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [hasReport, setHasReport] = useState(false);

    if (user?.user_type !== "auditor") {
        return <Navigate to="/audit" replace/>;
    }

    useEffect(() => {
        axiosInstance
            .get(`/audit/${auditId}/available-types`)
            .then((res) => setAvailableTypes(res.data.types))
            .catch(() => setError("Erreur lors du chargement des types d'audit."));
    }, [auditId]);

    useEffect(() => {
        axiosInstance.get(`/audit/${auditId}`).then((res) => {
            if (res.data?.file_path) {
                setReportUrl(res.data.file_path);
                setHasReport(true);
            } else {
                setHasReport(false);
            }
        }).catch(() => {
            setReportUrl(null);
            setHasReport(false);
        });
    }, [auditId]);


    const startAudit = async () => {
        const routeMap: Record<string, string> = {
            sqli: "/sqli/scan",
            xss: "/xss/scan",
            bruteforce: "/bruteforce/scan",
            ddos: "/ddos/scan",
            endpoint_discovery: "/endpoints/scan",
            web_technologies: "/wb/scan",
            http_header_identification: "/headers/scan",
        };

        const orderedTypes = [...selectedTypes.filter(t => t !== "ddos"), ...selectedTypes.filter(t => t === "ddos")];

        setAuditStatus(Object.fromEntries(selectedTypes.map(type => [type, "pending"])));
        setError("");
        setSuccess("");
        setLoading(true);

        const results: Record<string, any> = {};

        for (const type of orderedTypes) {
            const url = routeMap[type];
            const payload = {
                audit_id: auditId,
                unique_password: uniquePassword,
                ...(extraParams[type] || {})
            };

            try {
                const res = await axiosInstance.post(url, payload);
                setAuditStatus(prev => ({ ...prev, [type]: "success" }));
                results[type] = res.data;
            } catch (err) {
                setAuditStatus(prev => ({ ...prev, [type]: "error" }));
                results[type] = { error: err.response?.data?.message || "Erreur inconnue" };
            }
        }

        try {
            await axiosInstance.post("/reports/generate", {
                audit_id: auditId,
                results
            });
            setSuccess("Tous les audits sont terminés. Rapport généré.");

            const refreshed = await axiosInstance.get(`/audit/${auditId}`);
            if (refreshed.data?.file_path) {
                setReportUrl(refreshed.data.file_path);
                setHasReport(true);
            }
        } catch (e) {
            setError("Erreur lors de la génération du rapport.");
        }

        setLoading(false);
    };

    return (
        <Container>
            {reportUrl ? (
                <Group mb="lg">
                    <Text fw={600}>Rapport déjà généré :</Text>
                    <Button
                        onClick={async () => {
                            try {
                                const response = await axiosInstance.get(`/reports/download/${auditId}`, {
                                    responseType: "blob"
                                });

                                const blob = new Blob([response.data], { type: "application/pdf" });
                                const url = window.URL.createObjectURL(blob);

                                window.open(url, "_blank");

                                setTimeout(() => {
                                    window.URL.revokeObjectURL(url);
                                }, 5000);

                            } catch (err) {
                                console.error("Erreur lors du téléchargement", err);
                            }
                        }}
                        variant="outline"
                    >
                        Télécharger le rapport
                    </Button>

                </Group>
            ) : (
                <Alert color="blue" mb="lg">
                    Aucun rapport encore généré pour cet audit.
                </Alert>
            )}

            <Divider my="md" label="Lancer un audit" labelPosition="center" />

            <Title>Choisir un ou plusieurs types d’audit</Title>
            <Stack>
                <MultiSelect
                    label="Types d'audit"
                    placeholder="Choisissez un ou plusieurs types"
                    data={availableTypes}
                    value={selectedTypes}
                    onChange={setSelectedTypes}
                />
                <PasswordInput
                    label="Mot de passe unique"
                    placeholder="******"
                    value={uniquePassword}
                    onChange={(e) => setUniquePassword(e.currentTarget.value)}
                />
                {selectedTypes.map(type => (
                    <Stack key={type} mt="md">
                        <Text fw={600}>{type.toUpperCase()}</Text>
                        {(auditFieldConfig[type] || []).map(field => (
                            <div key={field.key}>
                                {field.type === "file" ? (
                                    <>
                                        <FileInput
                                            label={field.label}
                                            accept=".txt"
                                            placeholder="Sélectionnez un fichier"
                                            clearable
                                            onChange={(file) => {
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    const content = event.target?.result as string;
                                                    const lines = content
                                                        .split(/\r?\n/)
                                                        .map((line) => line.trim())
                                                        .filter((line) => line.length > 0);

                                                    setExtraParams((prev) => ({
                                                        ...prev,
                                                        [type]: {
                                                            ...prev[type],
                                                            [field.key]: lines,
                                                        },
                                                    }));
                                                };
                                                reader.readAsText(file);
                                            }}
                                        />

                                        {Array.isArray(extraParams[type]?.[field.key]) && (
                                            <Text size="xs" mt={4} c="dimmed">
                                                {extraParams[type][field.key].length} lignes chargées
                                            </Text>
                                        )}
                                    </>
                                ) : (
                                    <TextInput
                                        label={field.label}
                                        type={field.type}
                                        defaultValue={field.default}
                                        value={extraParams[type]?.[field.key] ?? ""}
                                        onChange={(e) => {
                                            const value = field.type === "number"
                                                ? Number(e.currentTarget.value)
                                                : e.currentTarget.value;
                                            setExtraParams((prev) => ({
                                                ...prev,
                                                [type]: {
                                                    ...prev[type],
                                                    [field.key]: value
                                                }
                                            }));
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </Stack>
                ))}

                <Button
                    disabled={selectedTypes.length === 0 || !uniquePassword || loading}
                    loading={loading}
                    onClick={() => {
                        if (hasReport) {
                            setConfirmOpen(true);
                        } else {
                            startAudit();
                        }
                    }}
                >
                    Démarrer les audits
                </Button>


                {selectedTypes.length > 0 && (
                    <Stack mt="md">
                        <Title order={4}>Progression des audits</Title>
                        {selectedTypes.map(type => (
                            <Group key={type}>
                                <Text>{type}</Text>
                                {auditStatus[type] === "pending" && <Loader size="xs" />}
                                {auditStatus[type] === "success" && <Text color="green">✅</Text>}
                                {auditStatus[type] === "error" && <Text color="red">❌</Text>}
                            </Group>
                        ))}
                    </Stack>
                )}

                {error && <Alert color="red">{error}</Alert>}
                {success && <Alert color="green">{success}</Alert>}
            </Stack>
            <ConfirmModal
                opened={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    setConfirmOpen(false);
                    startAudit();
                }}
                confirmLabel="Oui, remplacer"
                cancelLabel="Annuler"
                loading={loading}
                title="Rapport déjà existant"
            >
                <Text>
                    Un rapport existe déjà pour cet audit. Il sera supprimé et remplacé par le nouveau.
                    Voulez-vous continuer ?
                </Text>
            </ConfirmModal>

        </Container>
    );
}
