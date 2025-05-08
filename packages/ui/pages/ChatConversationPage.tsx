import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import PageTransition from "../components/PageTransition";
import axiosInstance from "../utils/axiosInstance";
import {BackButton} from "../components/BackButton";

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: number | null }>({ x: 0, y: 0, id: null });
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [partner, setPartner] = useState<{ firstname: string; lastname: string } | null>(null);

    useEffect(() => {
        if (!conversationId) return;
        axiosInstance.get(`/chat/messages/${conversationId}`)
            .then((res) => {
                setMessages(res.data.messages);
                setPartner(res.data.partner);
            })
            .catch(console.error);
    }, [conversationId]);

    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ x: 0, y: 0, id: null });
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;
        await axiosInstance.post(`/chat/messages/${conversationId}`, { content: input })
            .then((res) => setMessages((prev) => [...prev, res.data]))
            .catch(console.error);
        setInput("");
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
                    <Title order={3}>
                        {partner ? `${partner.firstname} ${partner.lastname}` : "Conversation"}
                    </Title>
                </Group>

                <Paper shadow="xs" p="sm" withBorder style={{ height: 400, display: "flex", flexDirection: "column" }}>
                    <ScrollArea style={{ flex: 1, position: "relative" }} viewportRef={scrollAreaRef}>
                        <Stack>
                            {messages.map((msg: any) => (
                                <Box
                                    key={msg.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                                    }}
                                >
                                    <Box
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            if (msg.from === "me") {
                                                setContextMenu({ x: e.clientX, y: e.clientY, id: msg.id });
                                            }
                                        }}

                                        p="sm"
                                        bg={msg.from === "me" ? "blue.0" : "gray.1"}
                                        maw={300}
                                        style={{
                                            display: "inline-flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            borderRadius: 16,
                                            minWidth: "calc(15rem * var(--mantine-scale))",
                                            cursor: msg.from === "me" ? "context-menu" : "default"
                                        }}
                                    >
                                        <Text style={{ wordBreak: "break-word" }}>{msg.content}</Text>
                                        <Text
                                            size="xs"
                                            color="dimmed"
                                            style={{ alignSelf: "flex-end", marginTop: 4 }}
                                        >
                                            {formatTimestamp(msg.timestamp)}
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                        {contextMenu.id !== null && (
                            <Box
                                style={{
                                    position: "fixed", // ← fix au lieu de absolute
                                    top: contextMenu.y,
                                    left: contextMenu.x,
                                    zIndex: 9999,
                                    backgroundColor: "white",
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    minWidth: 120,
                                    animation: "fadeIn 0.15s ease-in-out",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    size="xs"
                                    color="red"
                                    variant="subtle"
                                    fullWidth
                                    onClick={async () => {
                                        try {
                                            await axiosInstance.delete(`/chat/messages/${contextMenu.id}`);
                                            setMessages((prev) => prev.filter((m) => m.id !== contextMenu.id));
                                        } catch (err) {
                                            console.error("Erreur suppression message :", err);
                                        } finally {
                                            setContextMenu({ x: 0, y: 0, id: null });
                                        }
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
                                    handleSend();
                                }
                            }}
                        />
                        <Button onClick={handleSend}>Envoyer</Button>
                    </Group>
                </Paper>
            </Box>
        </PageTransition>
    );
}
