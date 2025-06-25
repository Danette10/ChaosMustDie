import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import {debounce} from 'lodash';
import {useNavigate, useParams} from 'react-router-dom';
import {Box, Button, Group, Paper, Text, Textarea, Title, useComputedColorScheme, useMantineTheme} from '@mantine/core';
import PageTransition from '../../components/PageTransition';
import axiosInstance from '../../utils/axiosInstance';
import {BackButton} from '../../components/BackButton';
import {useUser} from '../../context/UserContext';
import {useChatSocket} from '../../hooks/useChatSocket';
import {motion} from 'framer-motion';
import {Virtuoso} from 'react-virtuoso';

export default function ChatConversationPage() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === 'dark';
    const socketRef = useChatSocket();
    const isCurrentlyTyping = useRef(false);

    const [input, setInput] = useState('');
    const [partner, setPartner] = useState(null);
    const [typingUser, setTypingUser] = useState(false);

    // Messages reducer
    const messageReducer = (state, action) => {
        switch (action.type) {
            case 'SET_MESSAGES':
                return action.payload;
            case 'ADD_MESSAGE':
                return [...state, action.payload];
            default:
                return state;
        }
    };
    const [messages, dispatch] = useReducer(messageReducer, []);

    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    }, []);

    const emitTyping = () => {
        socketRef.current?.emit("typing", { conversation_id: conversationId, user_id: user?.id });
    };

    const emitStopTyping = useCallback(
        debounce(() => {
            socketRef.current?.emit("stop_typing", {conversation_id: conversationId, user_id: user?.id});
            isCurrentlyTyping.current = false;
        }, 1500),
        [conversationId, user]
    );

    useEffect(() => {
        if (!conversationId) return;
        axiosInstance.get(`/chat/messages/${conversationId}`).then(res => {
            dispatch({type: 'SET_MESSAGES', payload: res.data.messages});
            setPartner(res.data.partner);
        }).catch(console.error);
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId || !socketRef.current) return;
        const socket = socketRef.current;

        const handleNewMessage = (message) => {
            if (parseInt(conversationId) === message.conversation_id) {
                dispatch({
                    type: 'ADD_MESSAGE',
                    payload: {
                        id: message.id ?? Date.now(),
                        from: message.sender_id === user?.id ? "me" : "other",
                        content: message.content,
                        timestamp: message.timestamp
                    }
                });

                axiosInstance.post(`/chat/conversations/${conversationId}/read`).catch(console.error);
            }
        };

        socket.emit("join_conversation", { conversation_id: conversationId });
        socket.on("new_message", handleNewMessage);
        socket.on("typing", (data) => {
            if (data.conversation_id === conversationId) setTypingUser(true);
        });
        socket.on("stop_typing", (data) => {
            if (data.conversation_id === conversationId) setTypingUser(false);
        });

        return () => {
            socket.emit("stop_typing", { conversation_id: conversationId, user_id: user?.id });
            socket.off("new_message", handleNewMessage);
            socket.off("typing");
            socket.off("stop_typing");
        };
    }, [conversationId, user, socketRef]);

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

                <TypingIndicator typingUser={typingUser}/>

                <Paper shadow="xs" p="sm" withBorder style={{ height: 400, display: "flex", flexDirection: "column" }}>
                    <Virtuoso
                        style={{flex: 1}}
                        data={messages}
                        followOutput={(isAtBottom) => isAtBottom ? 'smooth' : false}
                        itemContent={(index, msg) => (
                            <Box key={msg.id} style={{
                                display: "flex",
                                justifyContent: msg.from === "me" ? "flex-end" : "flex-start"
                            }}>
                                <Box p="sm"
                                     bg={msg.from === "me" ? (isDark ? "blue.9" : "blue.0") : (isDark ? theme.colors.dark[5] : theme.colors.gray[1])}
                                     maw={300} style={{borderRadius: 16, minWidth: "15rem"}}>
                                    <Text style={{wordBreak: "break-word"}}>{msg.content}</Text>
                                    <Text size="sm" style={{alignSelf: "flex-end", marginTop: 4}}>
                                        <em>{formatTimestamp(msg.timestamp)}</em>
                                    </Text>
                                </Box>
                            </Box>
                        )}
                    />

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

// Composant TypingIndicator isolé
const TypingIndicator = ({typingUser}) => {
    if (!typingUser) return null;
    return (
        <motion.div animate={{opacity: [0.5, 1, 0.5]}} transition={{repeat: Infinity, duration: 1}}>
            <Text size="sm" color="dimmed" mb="sm">En train d’écrire...</Text>
        </motion.div>
    );
};
