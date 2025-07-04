import {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import {
    Alert,
    Button,
    Container,
    Divider,
    FileInput,
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
import {useUser} from "ui/context/UserContext";
import {auditFieldConfig} from "ui/utils/auditConfig";
import ConfirmModal from "../../modals/ConfirmModal";
import {AuditTypeEnum, AuditTypeLabels} from "ui/enum/AuditTypeEnum";

/**
 * Composant StartAuditPage.
 *
 * Ce composant permet à un auditeur de lancer différents types d'audits sur un projet spécifique.
 * Il inclut la sélection des types d'audit, la configuration des paramètres supplémentaires,
 * et la gestion de la progression des audits. Un rapport peut être généré et téléchargé après
 * la fin des audits.
 *
 * @returns {JSX.Element} Le composant StartAuditPage.
 */
export default function StartAuditPage() {
    const {auditId} = useParams(); // Récupère l'ID de l'audit depuis les paramètres de l'URL.
    const [availableTypes, setAvailableTypes] = useState<AuditTypeEnum[]>([]); // État pour les types d'audit disponibles.
    const [selectedTypes, setSelectedTypes] = useState<AuditTypeEnum[]>([]); // État pour les types d'audit sélectionnés.
    const [uniquePassword, setUniquePassword] = useState(""); // État pour le mot de passe unique requis pour les audits.
    const [error, setError] = useState(""); // État pour afficher les messages d'erreur.
    const [success, setSuccess] = useState(""); // État pour afficher les messages de succès.
    const {user} = useUser(); // Récupère les informations de l'utilisateur depuis le contexte.
    const [loading, setLoading] = useState(false); // État pour indiquer si les audits sont en cours.
    const [extraParams, setExtraParams] = useState<Record<string, any>>({}); // État pour les paramètres supplémentaires des audits.
    const [auditStatus, setAuditStatus] = useState<Record<string, "pending" | "success" | "error">>({}); // État pour la progression des audits.
    const [reportUrl, setReportUrl] = useState<string | null>(null); // URL du rapport généré.
    const [confirmOpen, setConfirmOpen] = useState(false); // État pour ouvrir ou fermer la modal de confirmation.
    const [hasReport, setHasReport] = useState(false); // Indique si un rapport existe déjà pour cet audit.

    // Redirige l'utilisateur si son type n'est pas "auditor".
    if (user?.user_type !== "auditor") {
        return <Navigate to="/audit" replace/>;
    }

    /**
     * Effet pour récupérer les types d'audit disponibles depuis l'API.
     */
    useEffect(() => {
        const fetchAvailableTypes = async () => {
            try {
                const res = await axiosInstance.get(`/audit/${auditId}/available-types`);
                setAvailableTypes(res.data.types.map((type: string) => type.toUpperCase()));
            } catch {
                setError("Erreur lors du chargement des types d'audit.");
            }
        };
        fetchAvailableTypes();
    }, [auditId]);

    /**
     * Effet pour récupérer les informations de l'audit, notamment le rapport existant.
     */
    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await axiosInstance.get(`/audit/${auditId}`);
                if (res.data?.file_path) {
                    setReportUrl(res.data.file_path);
                    setHasReport(true);
                } else {
                    setHasReport(false);
                }
            } catch {
                setReportUrl(null);
                setHasReport(false);
            }
        };
        fetchAudit();
    }, [auditId]);

    /**
     * Effet pour configurer les paramètres supplémentaires des audits sélectionnés.
     */
    useEffect(() => {
        setExtraParams((prevParams) => {
            const updatedParams = {...prevParams};
            for (const type of selectedTypes) {
                if (!updatedParams[type]) updatedParams[type] = {};
                for (const field of auditFieldConfig[type.toLowerCase()] || []) {
                    if (
                        updatedParams[type][field.key] === undefined &&
                        field.default !== undefined
                    ) {
                        updatedParams[type][field.key] = field.default;
                    }
                }
            }
            return updatedParams;
        });
    }, [selectedTypes]);

    /**
     * Fonction pour démarrer les audits sélectionnés.
     * Envoie les requêtes à l'API pour chaque type d'audit et génère un rapport.
     */
    const startAudit = async () => {
        const routeMap: Record<string, string> = {
            sqli: "/sqli/scan",
            xss: "/xss/scan",
            bruteforce: "/bruteforce/scan",
            ddos: "/ddos/scan",
            endpoint_discovery: "/endpoint/scan",
            web_technologies: "/wb/scan",
            http_header_identification: "/headers/scan",
        };

        const orderedTypes = [
            ...selectedTypes.filter((t) => t !== AuditTypeEnum.DDOS),
            ...selectedTypes.filter((t) => t === AuditTypeEnum.DDOS),
        ];

        setAuditStatus(Object.fromEntries(selectedTypes.map(type => [type, "pending"])));
        setError("");
        setSuccess("");
        setLoading(true);

        const results: Record<string, any> = {};
        const handled = new Set<string>();

        const isBothXssSqli = selectedTypes.includes(AuditTypeEnum.XSS) && selectedTypes.includes(AuditTypeEnum.SQLI);

        try {
            // Gestion des audits combinés XSS et SQLi.
            if (isBothXssSqli) {
                const url = routeMap["sqli"];
                const payload = {
                    audit_id: auditId,
                    unique_password: uniquePassword,
                    scan_xss: true,
                    scan_sqli: true,
                    ...(extraParams["xss"] || {}),
                    ...(extraParams["sqli"] || {}),
                };

                const res = await axiosInstance.post(url, payload);

                results["xss"] = res.data?.xss ?? {findings: []};
                results["sqli"] = res.data?.sqli ?? {findings: []};

                setAuditStatus(prev => ({...prev, xss: "success", sqli: "success"}));

                handled.add("xss");
                handled.add("sqli");
            }

            // Gestion des autres types d'audit.
            for (const type of orderedTypes) {
                if (handled.has(type)) continue;

                const url = routeMap[type.toLowerCase() as keyof typeof routeMap];
                const payload = {
                    audit_id: auditId,
                    unique_password: uniquePassword,
                    ...(extraParams[type] || {}),
                };

                const res = await axiosInstance.post(url, payload);
                results[type] = res.data;
                setAuditStatus(prev => ({...prev, [type]: "success"}));
                handled.add(type);
            }

            // Génération du rapport après les audits.
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
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                setError("Mot de passe unique invalide.");
            } else {
                setError("Erreur lors de l'exécution des audits.");
            }

            setAuditStatus(prev => {
                const updated = {...prev};
                Object.keys(updated).forEach(type => {
                    if (updated[type as AuditTypeEnum] === "pending") {
                        updated[type as AuditTypeEnum] = "error";
                    }
                });
                return updated;
            });
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
                                const blob = new Blob([response.data], {type: "application/pdf"});
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

            <Divider my="md" label="Lancer un audit" labelPosition="center"/>

            <Title>Choisir un ou plusieurs types d’audit</Title>
            <Stack>
                <MultiSelect
                    label="Types d'audit"
                    placeholder="Choisissez un ou plusieurs types"
                    data={availableTypes.map((type) => ({
                        value: type,
                        label: AuditTypeLabels[type] || type
                    }))}
                    value={selectedTypes}
                    onChange={(values) => setSelectedTypes(values as AuditTypeEnum[])}
                />
                <PasswordInput
                    label="Mot de passe unique"
                    placeholder="******"
                    value={uniquePassword}
                    onChange={(e) => setUniquePassword(e.currentTarget.value)}
                />
                {selectedTypes
                    .filter((type) => (auditFieldConfig[type.toLowerCase()] || []).length > 0)
                    .map(type => (
                        <Stack key={type} mt="md">
                            <Text fw={600}>{AuditTypeLabels[type] || type}</Text>
                            {(auditFieldConfig[type.toLowerCase()] || []).map(field => (
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
                                            {Array.isArray(extraParams[type]?.[field.key]) ? (
                                                <Text size="xs" mt={4} c="dimmed">
                                                    {extraParams[type][field.key].length} lignes chargées
                                                </Text>
                                            ) : (
                                                field.defaultName && (
                                                    <Text size="xs" mt={4} c="dimmed">
                                                        Fichier par défaut : <strong>{field.defaultName}</strong>
                                                    </Text>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        <TextInput
                                            label={field.label}
                                            type={field.type}
                                            value={extraParams[type]?.[field.key] ?? field.default?.toString() ?? ""}
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
                                <Text>{AuditTypeLabels[type] || type}</Text>
                                {auditStatus[type] === "pending" && <Loader size="xs"/>}
                                {auditStatus[type] === "success" && <Text c="green">✅</Text>}
                                {auditStatus[type] === "error" && <Text c="red">❌</Text>}
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