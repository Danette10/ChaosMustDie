import {useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {
    Badge,
    Box,
    Button,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    Title,
    useComputedColorScheme,
    useMantineTheme
} from "@mantine/core";
import PageTransition from "../../components/PageTransition";
import axiosInstance from "../../utils/axiosInstance";
import {BackButton} from "../../components/BackButton";
import ConfirmModal from "../../modals/ConfirmModal";
import {useUser} from "../../context/UserContext";
import {UserTypeEnum} from "../../enum/UserTypeEnum";
import EndAuditModal from "../../modals/EndAuditModal";
import {notifications} from "@mantine/notifications";
import {useChatSocket} from "../../hooks/useChatSocket";

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const { user } = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";
    const socketRef = useChatSocket();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [partner, setPartner] = useState<{
        company: { id: number } | null;
        id: number; firstname: string; lastname: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: number | null }>({ x: 0, y: 0, id: null });
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [auditStatus, setAuditStatus] = useState<string | null>(null);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [endAuditLoading, setEndAuditLoading] = useState(false);
    const [auditId, setAuditId] = useState<string | null>(null);

    // Chargement initial des messages
    useEffect(() => {
        if (!conversationId) return;

        axiosInstance.get(`/chat/messages/${conversationId}`)
            .then(res => {
                setMessages(res.data.messages);
                setPartner(res.data.partner);
                if (res.data.audit_id) {
                    setAuditId(res.data.audit_id);
                }
            })
            .catch(console.error);
    }, [conversationId]);

    // WebSocket temps réel
    useEffect(() => {
        if (!conversationId || !socketRef.current) return;

        socketRef.current.emit("join_conversation", {conversation_id: conversationId});

        const handleNewMessage = (message: any) => {
            if (parseInt(conversationId) === message.conversation_id) {
                setMessages(prev => [...prev, {
                    id: message.id ?? Date.now(),
                    from: message.sender_id === user?.id ? "me" : "other",
                    content: message.content,
                    timestamp: message.timestamp
                }]);
            }
        };

        socketRef.current.on("new_message", handleNewMessage);

        return () => {
            socketRef.current?.off("new_message", handleNewMessage);
        };
    }, [conversationId, user]);

    // Auto scroll à chaque nouveau message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
    }, [messages]);

    // Gestion Audit Status
    useEffect(() => {
        if (!partner || !user) return;

        const fetchAuditStatus = async () => {
            const auditor_id = user.user_type === UserTypeEnum.AUDITOR ? user.id : partner.id;
            const company_id = user.user_type === UserTypeEnum.COMPANY
                ? user.company?.id
                : partner.company?.id;

            if (!auditor_id || !company_id) {
                console.warn("Impossible de récupérer audit status : ID manquant");
                return;
            }

            try {
                const res = await axiosInstance.get("/audit/status", {
                    params: { auditor_id, company_id },
                });
                setAuditStatus(res.data.status);
            } catch (err) {
                console.error("Erreur récupération statut audit :", err);
            }
        };

        fetchAuditStatus();
    }, [partner, user]);

    // Envoi de message
    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            await axiosInstance.post(`/chat/messages/${conversationId}`, { content: input });
            setInput("");
        } catch (err) {
            console.error(err);
        }
    };

    // Suppression de message
    const deleteMessage = async () => {
        if (confirmDeleteId === null) return;
        setLoadingDelete(true);
        try {
            await axiosInstance.delete(`/chat/messages/${confirmDeleteId}`);
            setMessages(prev => prev.filter(m => m.id !== confirmDeleteId));
        } catch (err) {
            console.error("Erreur suppression :", err);
        } finally {
            setConfirmDeleteId(null);
            setLoadingDelete(false);
        }
    };

    // Gestion réponse Audit
    const handleAuditResponse = async (action: "accept" | "refuse") => {
        if (!user || !partner) return;

        const auditor_id = user.user_type === UserTypeEnum.COMPANY ? partner.id : user.id;
        const company_id = user.user_type === UserTypeEnum.COMPANY
            ? user.company.id
            : partner?.company?.id;

        if (!auditor_id || !company_id) {
            console.warn("Impossible d'envoyer la réponse à l’audit : ID manquant");
            return;
        }

        const formData = new FormData();
        formData.append("auditor_id", auditor_id.toString());
        formData.append("company_id", company_id.toString());
        formData.append("action", action);

        try {
            const res = await axiosInstance.patch("/audit/respond", formData);

            if (action === "accept" && res.data?.audit_id && conversationId) {
                await axiosInstance.patch(`/chat/conversation/${conversationId}/link-audit`, {
                    audit_id: res.data.audit_id,
                });
            }

            setAuditStatus(action === "accept" ? "in_progress" : null);
        } catch (err) {
            console.error(`Erreur lors de l’audit ${action}:`, err);
        }
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
            if (!auditId) {
                console.error("audit_id est manquant !");
                return;
            }
            formData.append("audit_id", auditId);
            if (data.success && data.reportFile) {
                formData.append("file", data.reportFile);
            }

            await axiosInstance.post("/audit/finish", formData);

            notifications.show({
                title: "Audit terminé",
                message: "L’audit a été terminé avec succès.",
                color: "green",
            });

            setAuditStatus("completed");
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

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    };

    return (
        <PageTransition>
            <Box p="md">
                <Group position="apart" mb="md">
                    <BackButton />
                    <Group spacing="sm">
                        <Title order={3}>
                            {partner ? `${partner.firstname} ${partner.lastname}` : "Conversation"}
                        </Title>

                        {user?.user_type === UserTypeEnum.COMPANY && (
                            auditStatus === "in_progress" ? (
                                <Badge color="teal" size="md">Audit en cours</Badge>
                            ) : (
                                <Button
                                    size="xs"
                                    variant="light"
                                    onClick={async () => {
                                        try {
                                            await axiosInstance.post("/audit/request", {
                                                auditor_id: partner?.id,
                                                company_id: user.company.id,
                                            });

                                            const statusRes = await axiosInstance.get("/audit/status", {
                                                params: {
                                                    auditor_id: partner?.id,
                                                    company_id: user.company.id,
                                                },
                                            });
                                            setAuditStatus(statusRes.data.status);
                                        } catch (err) {
                                            console.error("Erreur demande audit :", err);
                                        }
                                    }}
                                    disabled={auditStatus === "pending"}
                                >
                                    {auditStatus === "pending"
                                        ? "Demande d'audit envoyée"
                                        : "Demander un audit"}
                                </Button>
                            )
                        )}

                        {user?.user_type === UserTypeEnum.AUDITOR && auditStatus === "pending" && (
                            <Group spacing={4}>
                                <Button size="xs" color="green" variant="light" onClick={() => handleAuditResponse("accept")}>
                                    Accepter l'audit
                                </Button>
                                <Button size="xs" color="red" variant="light" onClick={() => handleAuditResponse("refuse")}>
                                    Refuser l'audit
                                </Button>
                            </Group>
                        )}
                        {user?.user_type === UserTypeEnum.AUDITOR && auditStatus === "in_progress" && (
                            <Group spacing={8}>
                                <Badge color="teal" size="md">Audit en cours</Badge>
                                <Button size="xs" variant="light" color="blue" onClick={() => setShowFinishModal(true)}>
                                    Terminer l'audit
                                </Button>
                            </Group>
                        )}
                    </Group>
                </Group>

                <Paper shadow="xs" p="sm" withBorder style={{ height: 400, display: "flex", flexDirection: "column" }}>
                    <ScrollArea style={{flex: 1}}>
                        <Stack>
                            {messages.map(msg => (
                                <Box
                                    key={msg.id}
                                    style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}
                                >
                                    <Box
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            if (msg.from === "me") {
                                                setContextMenu({ x: e.clientX, y: e.clientY, id: msg.id });
                                            }
                                        }}
                                        p="sm"
                                        bg={msg.from === "me" ? (isDark ? "blue.9" : "blue.0") : (isDark ? theme.colors.dark[5] : theme.colors.gray[1])}
                                        maw={300}
                                        style={{
                                            display: "inline-flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            borderRadius: 16,
                                            minWidth: "calc(15rem * var(--mantine-scale))",
                                            cursor: msg.from === "me" ? "context-menu" : "default",
                                        }}
                                    >
                                        <Text style={{ wordBreak: "break-word" }}>{msg.content}</Text>
                                        <Text size="sm" style={{ alignSelf: "flex-end", marginTop: 4 }}>
                                            <em>{formatTimestamp(msg.timestamp)}</em>
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                            <div ref={scrollRef}/>
                            {/* Pour auto scroll */}
                        </Stack>
                    </ScrollArea>

                    <Group mt="xs" grow>
                        <Textarea
                            placeholder="Votre message..."
                            value={input}
                            minRows={2}
                            autosize
                            onChange={(e) => setInput(e.currentTarget.value)}
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

            <ConfirmModal
                opened={confirmDeleteId !== null}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={deleteMessage}
                title="Suppression de message"
                confirmLabel="Supprimer"
                loading={loadingDelete}
            >
                <Text>
                    Voulez-vous vraiment supprimer ce message ? Cette action est{" "}
                    <Text span c="red" fw={500}>irréversible</Text>.
                </Text>
            </ConfirmModal>

            <EndAuditModal
                opened={showFinishModal}
                onClose={() => setShowFinishModal(false)}
                onSubmit={handleAuditEnd}
                loading={endAuditLoading}
            />
        </PageTransition>
    );
}
