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
import {useUser} from "../../context/UserContext";
import {UserTypeEnum} from "../../enum/UserTypeEnum";
import {useChatSocket} from "../../hooks/useChatSocket";

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const { user } = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";
    const socketRef = useChatSocket();

    const scrollRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [partner, setPartner] = useState(null);
    const [contextMenu, setContextMenu] = useState({x: 0, y: 0, id: null});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [auditStatus, setAuditStatus] = useState(null);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [endAuditLoading, setEndAuditLoading] = useState(false);
    const [auditId, setAuditId] = useState(null);
    const [typingUser, setTypingUser] = useState(null);

    useEffect(() => {
        if (!conversationId) return;
        axiosInstance.get(`/chat/messages/${conversationId}`)
            .then(res => {
                setMessages(res.data.messages);
                setPartner(res.data.partner);
                if (res.data.audit_id) setAuditId(res.data.audit_id);
            })
            .catch(console.error);
    }, [conversationId]);

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
            }
        };

        const handleTyping = (data) => {
            if (conversationId === data.conversation_id && data.user_id !== user?.id) {
                setTypingUser("En train d'écrire...");
            }
        };

        socketRef.current.on("new_message", handleNewMessage);
        socketRef.current.on("typing", handleTyping);
        socketRef.current.emit("join_conversation", {conversation_id: conversationId});

        return () => {
            socketRef.current?.off("new_message", handleNewMessage);
            socketRef.current?.off("typing", handleTyping);
            setTypingUser(null);
        };
    }, [conversationId, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
    }, [messages]);

    useEffect(() => {
        if (!partner || !user) return;
        const auditor_id = user.user_type === UserTypeEnum.AUDITOR ? user.id : partner.id;
        const company_id = user.user_type === UserTypeEnum.COMPANY ? user.company?.id : partner.company?.id;
        if (!auditor_id || !company_id) return;
        axiosInstance.get("/audit/status", {params: {auditor_id, company_id}})
            .then(res => setAuditStatus(res.data.status))
            .catch(console.error);
    }, [partner, user]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            await axiosInstance.post(`/chat/messages/${conversationId}`, { content: input });
            setInput("");
        } catch (err) {
            console.error(err);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    };

    return (
        <PageTransition>
            <Box p="md">
                {/* Header principal */}
                <Group position="apart" mb="xs">
                    <Group spacing="sm">
                        <BackButton/>
                        <Title order={3}>{partner ? `${partner.firstname} ${partner.lastname}` : "Conversation"}</Title>
                    </Group>

                    <Group spacing="sm">
                        {/* Badges et boutons à droite */}
                        {user?.user_type === UserTypeEnum.COMPANY && (auditStatus === "in_progress" ? (
                            <Badge color="teal">Audit en cours</Badge>
                        ) : (
                            <Button size="xs" variant="light" onClick={async () => {
                                try {
                                    await axiosInstance.post("/audit/request", {
                                        auditor_id: partner?.id,
                                        company_id: user.company.id,
                                    });
                                    const res = await axiosInstance.get("/audit/status", {
                                        params: {auditor_id: partner?.id, company_id: user.company.id}
                                    });
                                    setAuditStatus(res.data.status);
                                } catch (err) {
                                    console.error(err);
                                }
                            }} disabled={auditStatus === "pending"}>
                                {auditStatus === "pending" ? "Demande d'audit envoyée" : "Demander un audit"}
                            </Button>
                        ))}
                        {user?.user_type === UserTypeEnum.AUDITOR && auditStatus === "pending" && (
                            <Group spacing={4}>
                                <Button size="xs" color="green" variant="light"
                                        onClick={() => handleAuditResponse("accept")}>Accepter</Button>
                                <Button size="xs" color="red" variant="light"
                                        onClick={() => handleAuditResponse("refuse")}>Refuser</Button>
                            </Group>
                        )}
                        {user?.user_type === UserTypeEnum.AUDITOR && auditStatus === "in_progress" && (
                            <Group spacing={8}>
                                <Badge color="teal">Audit en cours</Badge>
                                <Button size="xs" variant="light" color="blue"
                                        onClick={() => setShowFinishModal(true)}>Terminer</Button>
                            </Group>
                        )}
                    </Group>
                </Group>

                {/* Typing séparé sous le header */}
                {typingUser && (
                    <Text size="sm" color="dimmed" mb="sm" ml={40}>{typingUser}</Text>
                )}

                <Paper shadow="xs" p="sm" withBorder style={{ height: 400, display: "flex", flexDirection: "column" }}>
                    <ScrollArea style={{flex: 1}}>
                        <Stack>
                            {messages.map(msg => (
                                <Box key={msg.id} style={{
                                    display: "flex",
                                    justifyContent: msg.from === "me" ? "flex-end" : "flex-start"
                                }}>
                                    <Box p="sm"
                                         bg={msg.from === "me" ? (isDark ? "blue.9" : "blue.0") : (isDark ? theme.colors.dark[5] : theme.colors.gray[1])}
                                         maw={300} style={{borderRadius: 16, minWidth: "15rem"}}>
                                        <Text style={{ wordBreak: "break-word" }}>{msg.content}</Text>
                                        <Text size="sm" style={{ alignSelf: "flex-end", marginTop: 4 }}>
                                            <em>{formatTimestamp(msg.timestamp)}</em>
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                            <div ref={scrollRef}/>
                        </Stack>
                    </ScrollArea>

                    <Group mt="xs" grow>
                        <Textarea placeholder="Votre message..." value={input} minRows={2} autosize
                                  onChange={(e) => {
                                      setInput(e.currentTarget.value);
                                      if (socketRef.current && user && conversationId) {
                                          socketRef.current.emit("typing", {
                                              conversation_id: conversationId,
                                              user_id: user.id
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
        </PageTransition>
    );
}