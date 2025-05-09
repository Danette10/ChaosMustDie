import { useEffect, useState } from "react";
import {
    Box,
    Group,
    Paper,
    Stack,
    Text,
    Title,
    useMantineTheme,
    useComputedColorScheme,
    Loader,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import axiosInstance from "../utils/axiosInstance";

export default function ChatListPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";

    useEffect(() => {
        axiosInstance.get("/chat/conversations")
            .then((res) => setConversations(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    };

    return (
        <PageTransition>
            <Box p="md">
                <Title order={3} mb="md">Mes conversations</Title>
                <Paper p="sm" shadow="xs" withBorder>
                    {loading ? (
                        <Loader />
                    ) : (
                        <Stack spacing="xs">
                            {conversations.map((conv: any) => (
                                <Paper
                                    key={conv.id}
                                    p="sm"
                                    radius="md"
                                    withBorder
                                    style={{
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                    }}
                                    onClick={() => navigate(`/chat/${conv.id}`)}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = isDark ? theme.colors.dark[5] : theme.colors.gray[0])
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = isDark ? theme.colors.dark[7] : theme.white)
                                    }
                                >
                                    <Stack spacing={4}>
                                        <Group position="apart" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <Text fw={500}>{conv.name}</Text>
                                            <Text size="sm">
                                                <em>
                                                    {conv.last_timestamp && formatTimestamp(conv.last_timestamp)}
                                                </em>
                                            </Text>
                                        </Group>
                                        <Text
                                            size="sm"
                                            color="dimmed"
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                display: "block",
                                            }}
                                        >
                                            {conv.last_message || "Aucun message"}
                                        </Text>
                                    </Stack>
                                </Paper>
                            ))}
                            {conversations.length === 0 && (
                                <Box ta="center" c="dimmed">
                                    Aucune conversation
                                </Box>
                            )}
                        </Stack>
                    )}
                </Paper>
            </Box>
        </PageTransition>
    );
}
