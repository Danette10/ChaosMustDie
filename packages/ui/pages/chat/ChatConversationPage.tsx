import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Group, Paper, ScrollArea, Stack, Text, Textarea, Title, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import PageTransition from '../../components/PageTransition';
import axiosInstance from '../../utils/axiosInstance';
import { BackButton } from '../../components/BackButton';
import { useUser } from '../../context/UserContext';
import { useChatSocket } from '../../hooks/useChatSocket';
import { motion } from 'framer-motion';

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === 'dark';
    const socketRef = useChatSocket();
    const isCurrentlyTyping = useRef(false);
    const scrollRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const atBottomRef = useRef(true);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [partner, setPartner] = useState(null);
    const [typingUser, setTypingUser] = useState(false);
    const [shouldScroll, setShouldScroll] = useState(false);

    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    }, []);

    const emitTyping = () => {
        socketRef.current?.emit("typing", { conversation_id: conversationId, user_id: user?.id });
    };

    const emitStopTyping = useMemo(() => debounce(() => {
        socketRef.current?.emit("stop_typing", { conversation_id: conversationId, user_id: user?.id });
        isCurrentlyTyping.current = false;
    }, 1500), [conversationId, user, socketRef]);

    const scrollToBottom = (smooth = true) => {
        scrollRef.current?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'end'
        });
    };

    useEffect(() => {
        if (!conversationId) return;
        axiosInstance.get(`/chat/messages/${conversationId}`).then(res => {
            setMessages(res.data.messages);
            setPartner(res.data.partner);
            setShouldScroll(true);
        }).catch(console.error);
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId || !socketRef.current) return;
        const socket = socketRef.current;

        const handleNewMessage = (message) => {
            if (parseInt(conversationId) === message.conversation_id) {
                setMessages(prev => [...prev, {
                    id: message.id ?? Date.now(),
                    from: message.sender_id === user?.id ? "me" : "other",
                    content: message.content,
                    timestamp: message.timestamp
                }]);

                axiosInstance.post(`/chat/conversations/${conversationId}/read`).catch(console.error);

                if (atBottomRef.current) {
                    setShouldScroll(true);
                }
            }
        };

        socket.emit("join_conversation", { conversation_id: conversationId });
        socket.on("new_message", handleNewMessage);
        socket.on("typing", (data) => {
            if (data.conversation_id === conversationId) {
                setTypingUser(true);
                if (atBottomRef.current) {
                    setShouldScroll(true);
                }
            }
        });
        socket.on("stop_typing", (data) => { if (data.conversation_id === conversationId) setTypingUser(false); });

        return () => {
            socket.emit("stop_typing", { conversation_id: conversationId, user_id: user?.id });
            socket.off("new_message", handleNewMessage);
        };
    }, [conversationId, user, socketRef]);

    const handleScrollPositionChange = ({ y }) => {
        const viewport = scrollAreaRef.current;
        if (!viewport) return;
        const distanceFromBottom = viewport.scrollHeight - y - viewport.clientHeight;
        atBottomRef.current = distanceFromBottom < 100;
    };

    useEffect(() => {
        if (shouldScroll) {
            setTimeout(() => {
                scrollToBottom();
                setShouldScroll(false);
            }, 0);
        }
    }, [messages, shouldScroll]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            await axiosInstance.post(`/chat/messages/${conversationId}`, { content: input });
            setInput('');
            socketRef.current?.emit("stop_typing", { conversation_id: conversationId, user_id: user?.id });
            emitStopTyping.cancel();
            isCurrentlyTyping.current = false;
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <PageTransition>
            <Box p="md">
                <Group position="apart" mb="xs">
                    <Group spacing="sm">
                        <BackButton onClick={() => {
                            socketRef.current?.emit("stop_typing", { conversation_id: conversationId, user_id: user?.id });
                            navigate(-1);
                        }} />
                        <Title order={3}>{partner ? `${partner.firstname} ${partner.lastname}` : "Conversation"}</Title>
                    </Group>
                </Group>

                {typingUser && (
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Text size="sm" color="dimmed" mb="sm">En train d’écrire...</Text>
                    </motion.div>
                )}

                <Paper shadow="xs" p="sm" withBorder style={{ height: 400, display: "flex", flexDirection: "column" }}>
                    <ScrollArea style={{ flex: 1 }} viewportRef={scrollAreaRef} onScrollPositionChange={({ y }) => handleScrollPositionChange({ y })}>
                        <Stack>
                            {messages.map(msg => (
                                <Box key={msg.id} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
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
                                const value = e.currentTarget.value;
                                setInput(value);
                                if (value.trim().length > 0) {
                                    if (!isCurrentlyTyping.current) {
                                        emitTyping();
                                        isCurrentlyTyping.current = true;
                                    }
                                    emitStopTyping();
                                } else {
                                    emitStopTyping.cancel();
                                    socketRef.current?.emit("stop_typing", { conversation_id: conversationId, user_id: user?.id });
                                    isCurrentlyTyping.current = false;
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
