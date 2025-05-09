import {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import {Alert, Button, Container, PasswordInput, Select, Stack, TextInput, Title} from "@mantine/core";
import axiosInstance from "../utils/axiosInstance";
import {useUser} from "../context/UserContext";
import {auditFieldConfig} from "../utils/auditConfig";

export default function StartAuditPage() {
    const {auditId} = useParams();
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [uniquePassword, setUniquePassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    const [extraParams, setExtraParams] = useState<Record<string, any>>({});

    if (user?.user_type !== "auditor") {
        return <Navigate to="/audit" replace/>;
    }

    useEffect(() => {
        axiosInstance
            .get(`/audit/${auditId}/available-types`)
            .then((res) => setAvailableTypes(res.data.types))
            .catch(() => setError("Erreur lors du chargement des types d'audit."));
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

        if (!selectedType || !routeMap[selectedType]) {
            setError("Type d’audit non supporté");
            setSuccess("");
            return;
        }

        try {
            const payload = {
                audit_id: auditId,
                unique_password: uniquePassword,
                ...extraParams,
            };
            await axiosInstance.post(routeMap[selectedType], payload);

            setSuccess("Audit démarré avec succès !");
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du démarrage de l’audit");
            setSuccess("");
        }
    };

    return (
        <Container>
            <Title>Choisir un type d’audit</Title>
            <Stack>
                <Select
                    label="Type d'audit"
                    placeholder="Choisissez un type"
                    data={availableTypes}
                    value={selectedType}
                    onChange={setSelectedType}
                />
                <PasswordInput
                    label="Mot de passe unique"
                    placeholder="******"
                    value={uniquePassword}
                    onChange={(e) => setUniquePassword(e.currentTarget.value)}
                />
                {(auditFieldConfig[selectedType || ""] || []).map(field => (
                    <TextInput
                        key={field.key}
                        label={field.label}
                        type={field.type}
                        defaultValue={field.default}
                        value={extraParams[field.key] ?? ""}
                        onChange={(e) => {
                            const value = field.type === "number" ? Number(e.currentTarget.value) : e.currentTarget.value;
                            setExtraParams((prev) => ({...prev, [field.key]: value}));
                        }}
                    />
                ))}
                <Button
                    disabled={!selectedType || !uniquePassword || loading}
                    loading={loading}
                    onClick={startAudit}
                >
                    Démarrer l’audit
                </Button>
                {error && <Alert color="red">{error}</Alert>}
                {success && <Alert color="green">{success}</Alert>}
            </Stack>
        </Container>
    );
}
