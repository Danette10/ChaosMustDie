import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    Badge, Box, Button, Group, Modal, Paper, ScrollArea, Stack, Text, Textarea, Title,
    useComputedColorScheme, useMantineTheme
} from "@mantine/core";
import PageTransition from "../../components/PageTransition";
import axiosInstance from "../../utils/axiosInstance";
import { BackButton } from "../../components/BackButton";
import { useUser } from "../../context/UserContext";
import { UserTypeEnum } from "../../enum/UserTypeEnum";
import { useChatSocket } from "../../hooks/useChatSocket";
import { motion } from "framer-motion";
import EndAuditModal from "../../modals/EndAuditModal";
import {notifications} from "@mantine/notifications";

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";
    const socketRef = useChatSocket();

    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [partner, setPartner] = useState(null);
    const [typingUser, setTypingUser] = useState(false);
    const [audit, setAudit] = useState(null);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [endAuditLoading, setEndAuditLoading] = useState(false);

    // Chargement initial
    useEffect(() => {
        if (!conversationId) return;
        axiosInstance.get(`/chat/messages/${conversationId}`)
            .then(res => {
                setMessages(res.data.messages);
                setPartner(res.data.partner);
                setAudit(res.data.audit ?? null);
            })
            .catch(console.error);
    }, [conversationId]);

    // Websocket
    useEffect(() => {
        if (!conversationId || !socketRef.current) return;

        const handleNewMessage = (message) => {
            if (parseInt(conversationId) === message.conversation_id) {
                setMessages(prev => [...prev, {
                    id: message.id ?? Date.now(),
                    from: message.sender_id === user?.id ? "me" : "other",
                    content: message.content,
                    timestamp: message.timestamp
                }]);

                axiosInstance.post(`/chat/conversations/${conversationId}/read`).catch(console.error);
            }
        };

        const handleTyping = (data) => {
            if (conversationId === data.conversation_id && data.user_id !== user?.id) {
                setTypingUser(true);
            }
        };

        const handleStopTyping = (data) => {
            if (conversationId === data.conversation_id && data.user_id !== user?.id) {
                setTypingUser(false);
            }
        };

        socketRef.current.on("new_message", handleNewMessage);
        socketRef.current.on("typing", handleTyping);
        socketRef.current.on("stop_typing", handleStopTyping);
        socketRef.current.on("typing_state", (data) => {
            if (data.conversation_id === conversationId) {
                const isPartnerTyping = data.typing_users.some(id => id !== user?.id);
                setTypingUser(isPartnerTyping);
            }
        });

        socketRef.current.emit("join_conversation", { conversation_id: conversationId });

        return () => {
            socketRef.current?.emit("stop_typing", { conversation_id: conversationId, user_id: user.id });
            socketRef.current?.off("new_message", handleNewMessage);
            socketRef.current?.off("typing", handleTyping);
            socketRef.current?.off("stop_typing", handleStopTyping);
            setTypingUser(false);
        };
    }, [conversationId, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            await axiosInstance.post(`/chat/messages/${conversationId}`, { content: input });
            setInput("");
            socketRef.current?.emit("stop_typing", { conversation_id: conversationId, user_id: user.id });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRequestAudit = async () => {
        try {
            await axiosInstance.post("/audit/request", {
                auditor_id: partner?.id,
                company_id: user?.company?.id
            });
            const res = await axiosInstance.get("/audit/status", {
                params: { auditor_id: partner?.id, company_id: user?.company?.id }
            });
            setAudit(res.data.audit);
        } catch (err) {
            console.error(err);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    };

    // Terminer l'audit
    const handleAuditEnd = async (data: { success: boolean; comment: string; reportFile?: File }) => {
        setEndAuditLoading(true);
        try {
            const formData = new FormData();
            formData.append("auditor_id", user.id.toString());
            formData.append("company_id", partner?.company?.id?.toString() || "");
            formData.append("success", data.success.toString());
            formData.append("comment", data.comment);
            if (!audit?.id) {
                console.error("audit_id est manquant !");
                return;
            }
            formData.append("audit_id", audit.id.toString());
            if (data.success && data.reportFile) {
                formData.append("file", data.reportFile);
            }

            await axiosInstance.post("/audit/finish", formData);

            notifications.show({
                title: "Audit terminé",
                message: "L’audit a été terminé avec succès.",
                color: "green",
            });

            setAudit({ ...audit, status: "completed" });
            setShowFinishModal(false);
        } catch (err) {
            console.error("Erreur lors de la fin d'audit :", err);
            notifications.show({
                title: "Erreur",
                message: "Impossible de terminer l’audit. Veuillez réessayer.",
                color: "red",
            });
        } finally {
            setEndAuditLoading(false);
        }
    };


    return (
        <PageTransition>
            <Box p="md">
                <Group position="apart" mb="xs">
                    <Group spacing="sm">
                        <BackButton onClick={() => navigate(-1)} />
                        <Stack spacing={0}>
                            <Title order={3}>{partner ? `${partner.firstname} ${partner.lastname}` : "Conversation"}</Title>
                            {typingUser && (
                                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                                    <Text size="sm" color="dimmed" mt={4}>En train d’écrire...</Text>
                                </motion.div>
                            )}
                        </Stack>
                    </Group>

                    <Group spacing="sm">
                        {user?.user_type === UserTypeEnum.COMPANY && (
                            audit ? (
                                audit.status === "in_progress" ? (
                                    <Badge color="teal">Audit en cours</Badge>
                                ) : audit.status === "pending" ? (
                                    <Badge color="yellow">Demande envoyée</Badge>
                                ) : audit.status === "completed" ? (
                                    <Badge color="gray">Audit terminé</Badge>
                                ) : (
                                    <Badge color="gray">Aucun audit</Badge>
                                )
                            ) : (
                                <Button size="xs" variant="light" onClick={handleRequestAudit}>Demander un audit</Button>
                            )
                        )}

                        {user?.user_type === UserTypeEnum.AUDITOR && audit?.status === "in_progress" && (
                            <Group spacing={8}>
                                <Badge color="teal">Audit en cours</Badge>
                                <Button size="xs" variant="light" color="blue" onClick={() => setShowFinishModal(true)}>Terminer</Button>
                            </Group>
                        )}
                    </Group>
                </Group>

                <Paper shadow="xs" p="sm" withBorder style={{ height: 400, display: "flex", flexDirection: "column" }}>
                    <ScrollArea style={{ flex: 1 }}>
                        <Stack>
                            {messages.map(msg => (
                                <Box key={msg.id} style={{
                                    display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start"
                                }}>
                                    <Box p="sm" bg={msg.from === "me" ? (isDark ? "blue.9" : "blue.0") : (isDark ? theme.colors.dark[5] : theme.colors.gray[1])}
                                         maw={300} style={{ borderRadius: 16, minWidth: "15rem" }}>
                                        <Text style={{ wordBreak: "break-word" }}>{msg.content}</Text>
                                        <Text size="sm" style={{ alignSelf: "flex-end", marginTop: 4 }}>
                                            <em>{formatTimestamp(msg.timestamp)}</em>
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                            <div ref={scrollRef} />
                        </Stack>
                    </ScrollArea>

                    <Group mt="xs" grow>
                        <Textarea
                            placeholder="Votre message..." value={input} minRows={2} autosize
                            onChange={(e) => {
                                setInput(e.currentTarget.value);
                                if (socketRef.current) {
                                    socketRef.current.emit("typing", {
                                        conversation_id: conversationId, user_id: user?.id
                                    });
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                        />
                        <Button onClick={sendMessage}>Envoyer</Button>
                    </Group>
                </Paper>
            </Box>

            <EndAuditModal
                opened={showFinishModal}
                onClose={() => setShowFinishModal(false)}
                onSubmit={handleAuditEnd}
                loading={endAuditLoading}
            />

        </PageTransition>
    );
}
