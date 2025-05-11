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

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const { user } = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";

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
    const [success, setSuccess] = useState<boolean | null>(null);
    const [comment, setComment] = useState("");
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [endAuditLoading, setEndAuditLoading] = useState(false);

    useEffect(() => {
        if (!conversationId) return;

        axiosInstance.get(`/chat/messages/${conversationId}`)
            .then(res => {
                setMessages(res.data.messages);
                setPartner(res.data.partner);
            })
            .catch(console.error);
    }, [conversationId]);

    useEffect(() => {
        const hideContextMenu = () => setContextMenu({ x: 0, y: 0, id: null });
        window.addEventListener("click", hideContextMenu);
        return () => window.removeEventListener("click", hideContextMenu);
    }, []);

    useEffect(() => {
        if (!partner || !user) return;

        const fetchAuditStatus = async () => {
            if (!partner || !user) return;

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

    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            const res = await axiosInstance.post(`/chat/messages/${conversationId}`, { content: input });
            setMessages(prev => [...prev, res.data]);
            setInput("");
        } catch (err) {
            console.error(err);
        }
    };

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

    const handleAuditResponse = async (action: "accept" | "refuse") => {
        if (!user || !partner) return;

        const auditor_id = user.user_type === UserTypeEnum.COMPANY ? partner.id : user.id;
        const company_id = user.user_type === UserTypeEnum.COMPANY
            ? user.company.id
            : partner?.company?.id;

        if (!auditor_id || !company_id) {
            console.warn("Impossible d'envoyer la réponse à l'audit : ID manquant");
            return;
        }

        const formData = new FormData();
        formData.append("auditor_id", auditor_id.toString());
        formData.append("company_id", company_id.toString());
        formData.append("action", action);

        try {
            await axiosInstance.patch("/audit/respond", formData);
            setAuditStatus(action === "accept" ? "in_progress" : null);
        } catch (err) {
            console.error(`Erreur lors de l’audit ${action}:`, err);
        }
    };

    const handleAuditEnd = async (data: { success: boolean; comment: string; reportFile?: File }) => {
        setEndAuditLoading(true);
        try {
            const formData = new FormData();
            formData.append("auditor_id", user.id.toString());
            formData.append("company_id", partner?.company?.id?.toString() || "");
            formData.append("success", data.success.toString());
            formData.append("comment", data.comment);
            if (data.success && data.reportFile) {
                formData.append("report", data.reportFile);
            }

            await axiosInstance.post("/audit/finish", formData);
            setAuditStatus("done");
            setShowFinishModal(false);
        } catch (err) {
            console.error("Erreur lors de la fin d'audit :", err);
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
                                            // Re-fetch après création
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
                    <ScrollArea style={{ flex: 1 }} viewportRef={scrollRef}>
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
                        </Stack>

                        {contextMenu.id !== null && (
                            <Box
                                style={{
                                    position: "fixed",
                                    top: contextMenu.y,
                                    left: contextMenu.x,
                                    zIndex: 9999,
                                    backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    minWidth: 120,
                                    border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    fullWidth
                                    onClick={() => {
                                        setContextMenu({ x: 0, y: 0, id: null });
                                        setConfirmDeleteId(contextMenu.id!);
                                    }}
                                >
                                    Supprimer
                                </Button>
                            </Box>
                        )}
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
