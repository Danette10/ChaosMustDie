import {useEffect, useState} from "react";
import {
    Badge,
    Box,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
    useComputedColorScheme,
    useMantineTheme
} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import PageTransition from "../../components/PageTransition";
import axiosInstance from "../../utils/axiosInstance";
import {useSocket} from "ui/hooks/useSocket";
import {motion} from "framer-motion";

/**
 * Composant ChatListPage.
 *
 * Ce composant représente la page affichant la liste des conversations de l'utilisateur.
 * Il récupère les conversations via une requête API, gère les événements en temps réel via un socket,
 * et permet de naviguer vers une conversation spécifique.
 *
 * @returns {JSX.Element} Le composant ChatListPage.
 */
export default function ChatListPage() {
    const [conversations, setConversations] = useState<any[]>([]); // État contenant la liste des conversations.
    const [loading, setLoading] = useState(true); // État indiquant si les données sont en cours de chargement.
    const [typingMap, setTypingMap] = useState<Record<string, boolean>>({}); // État indiquant les conversations où un utilisateur écrit.
    const navigate = useNavigate(); // Hook pour naviguer entre les pages.
    const theme = useMantineTheme(); // Thème Mantine utilisé pour les styles.
    const colorScheme = useComputedColorScheme(); // Détermine le mode clair ou sombre.
    const isDark = colorScheme === "dark"; // Indique si le thème actuel est sombre.
    const socketRef = useSocket(); // Référence au socket pour gérer les événements en temps réel.

    /**
     * Effet pour récupérer les conversations et rejoindre les conversations via le socket.
     */
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axiosInstance.get("/chat/conversations");
                setConversations(res.data);
                if (socketRef.current) {
                    socketRef.current.emit("join_conversations_bulk", {
                        conversation_ids: res.data.map((c: any) => c.id),
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [socketRef]);

    /**
     * Effet pour gérer les événements en temps réel via le socket.
     * Les événements incluent la saisie, l'arrêt de la saisie, les nouveaux messages,
     * les messages supprimés et les messages lus.
     */
    useEffect(() => {
        if (!socketRef.current) return;

        const handleTyping = (data: any) => {
            setTypingMap(prev => ({...prev, [data.conversation_id]: true}));
        };

        const handleStopTyping = (data: any) => {
            setTypingMap(prev => ({...prev, [data.conversation_id]: false}));
        };

        const handleMessageDeleted = (data: any) => {
            setConversations(prev => prev.map(conv => {
                if (conv.id !== data.conversation_id) return conv;

                const isLastMessage = conv.last_message_id === data.message_id;

                return {
                    ...conv,
                    last_message: isLastMessage ? "Message supprimé" : conv.last_message,
                    last_message_id: isLastMessage ? data.message_id : conv.last_message_id,
                    unread_count: data.was_unread && isLastMessage
                        ? Math.max(conv.unread_count - 1, 0)
                        : conv.unread_count
                };
            }));
        };

        const handleNewMessage = (data: any) => {
            setConversations(prev => prev.map(conv => {
                if (conv.id === data.conversation_id) {
                    return {
                        ...conv,
                        last_message: data.content,
                        last_timestamp: data.timestamp,
                        unread_count: conv.unread_count + 1
                    };
                }
                return conv;
            }));
            setTypingMap(prev => ({...prev, [data.conversation_id]: false}));
        };

        const handleMessageRead = (data: any) => {
            setConversations(prev => prev.map(conv => {
                if (conv.id === data.conversation_id && conv.unread_count > 0) {
                    return {
                        ...conv,
                        unread_count: conv.unread_count - 1
                    };
                }
                return conv;
            }));
        };

        socketRef.current.on("typing", handleTyping);
        socketRef.current.on("stop_typing", handleStopTyping);
        socketRef.current.on("new_message", handleNewMessage);
        socketRef.current.on("message_read", handleMessageRead);
        socketRef.current.on("message_deleted", handleMessageDeleted);

        return () => {
            socketRef.current?.off("typing", handleTyping);
            socketRef.current?.off("stop_typing", handleStopTyping);
            socketRef.current?.off("new_message", handleNewMessage);
            socketRef.current?.off("message_read", handleMessageRead);
            socketRef.current?.off("message_deleted", handleMessageDeleted);
        };
    }, [socketRef]);

    /**
     * Fonction pour formater un horodatage en une chaîne lisible.
     *
     * @param {string} timestamp - L'horodatage à formater.
     * @returns {string} Le texte formaté représentant la date et l'heure.
     */
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
                        <Loader/>
                    ) : (
                        <Stack gap="xs">
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
                                    onClick={async () => {
                                        try {
                                            await axiosInstance.post(`/chat/conversations/${conv.id}/read`);
                                        } catch (err) {
                                            console.error(err);
                                        } finally {
                                            navigate(`/chat/${conv.id}`);
                                        }
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = isDark ? theme.colors.dark[5] : theme.colors.gray[0])
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = isDark ? theme.colors.dark[7] : theme.white)
                                    }
                                >
                                    <Stack gap={4}>
                                        <Group justify="space-between"
                                               style={{justifyContent: "space-between", alignItems: "center"}}>
                                            <Text fw={500}>{conv.name}</Text>
                                            <Text size="sm">
                                                <em>
                                                    {conv.last_timestamp && formatTimestamp(conv.last_timestamp)}
                                                </em>
                                            </Text>
                                        </Group>

                                        <Group justify="space-between">
                                            <Text
                                                size="md"
                                                c="dimmed"
                                                component="span"
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    display: "block",
                                                }}
                                            >
                                                {typingMap[conv.id] ? (
                                                    <motion.span style={{display: "inline-flex", gap: "4px"}}>
                                                        {[0, 1, 2].map((i) => (
                                                            <motion.span
                                                                key={i}
                                                                style={{fontSize: "20px", fontWeight: 500}}
                                                                animate={{opacity: [0.2, 1, 0.2]}}
                                                                transition={{
                                                                    repeat: Infinity,
                                                                    duration: 1.5,
                                                                    ease: "easeInOut",
                                                                    delay: i * 0.3,
                                                                }}
                                                            >
                                                                •
                                                            </motion.span>
                                                        ))}
                                                    </motion.span>
                                                ) : (
                                                    conv.last_message || "Aucun message"
                                                )}
                                            </Text>

                                            {conv.unread_count > 0 && (
                                                <Badge color="red" size="sm">{conv.unread_count}</Badge>
                                            )}
                                        </Group>
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