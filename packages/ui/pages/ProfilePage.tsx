import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Paper,
    Stack,
    Text,
    Title,
    Alert
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Loader } from "../components/Loader";
import {UserTypeEnum, UserTypeLabel} from "../enum/UserType";

export default function ProfilePage() {
    const { user } = useUser();
    const [allAudits, setAllAudits] = useState<string[]>([]);
    const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showAlert, setShowAlert] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get("/profile/audits")
            .then((res) => {
                setAllAudits(res.data.all);
                setSelectedAudits(res.data.selected);
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des audits :", err);
                setError("Erreur lors du chargement des types d'audit");
                setSuccess("");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (auditType: string) => {
        setSelectedAudits((prev) =>
            prev.includes(auditType)
                ? prev.filter((a) => a !== auditType)
                : [...prev, auditType]
        );
    };

    const handleSave = () => {
        axiosInstance
            .post("/profile/audits", { selected: selectedAudits })
            .then(() => {
                setSuccess("Préférences enregistrées avec succès");
                setError("");
                setShowAlert(true);
            })
            .catch((err) => {
                console.error("Erreur lors de la sauvegarde :", err);
                setError("Erreur lors de l'enregistrement");
                setSuccess("");
                setShowAlert(true);
            });
    };

    useEffect(() => {
        if (success || error) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    if (loading) return <Loader />;

    return (
        <Container size="sm" p="md">
            <Paper p="lg" radius="md" shadow="sm">
                <Title order={2} mb="xs">Profil</Title>
                {error && showAlert && (
                    <Alert color="red" icon={<IconX size={16} />} mb="sm">
                        {error}
                    </Alert>
                )}
                {success && showAlert && (
                    <Alert color="green" icon={<IconCheck size={16} />} mb="sm">
                        {success}
                    </Alert>
                )}
                <Box>
                    <Title order={3} mb="xs" align="center">Informations utilisateur</Title>
                    <Text mb="xs"><strong>Nom :</strong> {user?.last_name}</Text>
                    <Text mb="xs"><strong>Prénom :</strong> {user?.first_name}</Text>
                    <Text mb="xs"><strong>Email :</strong> {user?.email}</Text>
                    <Text mb="xs"><strong>Type d'utilisateur :</strong> {user && UserTypeLabel[user.user_type]}</Text>
                </Box>

                <Box>
                    <Title order={3} mt="md" mb="xs" align="center">Types d'audit souhaités</Title>
                    <Stack spacing="xs">
                        {allAudits.map((type) => (
                            <Checkbox
                                key={type}
                                label={type}
                                checked={selectedAudits.includes(type)}
                                onChange={() => handleToggle(type)}
                            />
                        ))}
                    </Stack>

                    <Button fullWidth mt="lg" onClick={handleSave}>
                        Enregistrer
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};
