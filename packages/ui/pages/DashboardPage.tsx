import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Loader } from "../components/Loader";
import {
    Badge,
    Box,
    Button,
    Container,
    Group, MultiSelect,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title
} from "@mantine/core";

export default function DashboardPage() {
    const { user } = useUser();
    const [auditors, setAuditors] = useState([]);
    const [auditTypes, setAuditTypes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user === undefined) return;

        if (user?.user_type === "company") {
            Promise.all([
                axiosInstance.get("/profile/auditors"),
                axiosInstance.get("/profile/audits")
            ])
                .then(([auditorsRes, auditsRes]) => {
                    setAuditors(auditorsRes.data);
                    setAuditTypes(auditsRes.data.all);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const filteredAuditors =
        selectedTypes.length > 0
            ? auditors.filter((auditor) =>
                selectedTypes.every((type) => auditor.audit_types.includes(type))
            )
            : auditors;

    const getBadgeColor = (type: string) => {
        switch (type) {
            case "SQLI":
                return "red";
            case "DDOS":
                return "orange";
            case "BRUTEFORCE":
                return "blue";
            case "WEB_TECHNOLOGIES":
                return "green";
            case "ENDPOINT_DISCOVERY":
                return "grape";
            default:
                return "gray";
        }
    };

    if (loading) return <Loader />;

    return (
        <Container size="lg" py="lg">
            <Stack spacing="xl">
                <Box>
                    <Title order={2}>Bienvenue, {user?.first_name}</Title>
                </Box>

                {user?.user_type === "company" && (
                    <>
                        <Paper shadow="sm" p="lg" withBorder>
                            <Group position="apart" mb="sm">
                                <Title order={4}>Filtres par type d'audit</Title>
                            </Group>

                            <MultiSelect
                                label="Filtres par type d'audit"
                                placeholder="Sélectionner un ou plusieurs types"
                                data={auditTypes}
                                value={selectedTypes}
                                onChange={setSelectedTypes}
                                searchable
                                clearable
                                nothingFoundMessage="Aucun type trouvé"
                            />

                            {selectedTypes.length > 0 && (
                                <Group mt="md" spacing="xs" wrap="wrap">
                                    {selectedTypes.map((type) => (
                                        <Badge key={type} color={getBadgeColor(type)} variant="outline">
                                            {type}
                                        </Badge>
                                    ))}
                                </Group>
                            )}
                        </Paper>

                        <Box>
                            <Group position="apart" mb="md">
                                <Title order={3}>Auditeurs disponibles</Title>
                                <Button variant="filled">Voir tous les auditeurs</Button>
                            </Group>

                            <SimpleGrid cols={1} breakpoints={[{ minWidth: 768, cols: 2 }]} spacing="md">
                                {filteredAuditors.slice(0, 5).map((auditor) => (
                                    <Paper key={auditor.id} shadow="xs" p="md" withBorder>
                                        <Text fw={600}>{auditor.name}</Text>
                                        <Text size="sm" c="dimmed">
                                            {auditor.email}
                                        </Text>
                                        <Group spacing="xs" mt="xs" wrap="wrap">
                                            {auditor.audit_types.map((type: string) => (
                                                <Badge key={type} color={getBadgeColor(type)} variant="outline">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Paper>
                                ))}
                                {filteredAuditors.length === 0 && (
                                    <Text color="dimmed">Aucun auditeur ne correspond à ces filtres.</Text>
                                )}
                            </SimpleGrid>
                        </Box>
                    </>
                )}
            </Stack>
        </Container>
    );
};
