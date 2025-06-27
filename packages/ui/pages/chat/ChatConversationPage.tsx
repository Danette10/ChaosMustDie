import React, {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import {debounce} from 'lodash';
import {useNavigate, useParams} from 'react-router-dom';
import {ActionIcon, Box, Group, Input, Paper, Title, useComputedColorScheme, useMantineTheme} from '@mantine/core';
import {Virtuoso, VirtuosoHandle} from 'react-virtuoso';
import PageTransition from '../../components/PageTransition';
import axiosInstance from '../../utils/axiosInstance';
import {BackButton} from '../../components/BackButton';
import {useUser} from '../../context/UserContext';
import {useSocket} from '../../hooks/useSocket';
import ConfirmModal from "../../modals/ConfirmModal";
import {MessageItem} from './components/MessageItem';
import {TypingIndicator} from './components/TypingIndicator';
import {Message, MessageAction, messageReducer} from './components/messageReducer';
import {IconArrowDown, IconSend} from '@tabler/icons-react';

export default function ChatConversationPage() {
    const {conversationId} = useParams();
    const navigate = useNavigate();
    const {user} = useUser();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === 'dark';
    const socketRef = useSocket();
    const isCurrentlyTyping = useRef(false);

    const [input, setInput] = useState('');
    const [partner, setPartner] = useState(null);
    const [typingUser, setTypingUser] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const virtuosoRef = useRef<VirtuosoHandle | null>(null);

    const [messages, dispatch] = useReducer<React.Reducer<Message[], MessageAction>>(messageReducer, []);

    const prevLengthRef = useRef(0);
    const isAtBottomRef = useRef(true);

    useEffect(() => {
        if (messages.length > prevLengthRef.current && isAtBottomRef.current) {
            virtuosoRef.current?.scrollToIndex({
                index: messages.length - 1,
                behavior: 'smooth'
            });
        }
        prevLengthRef.current = messages.length;
    }, [messages]);


    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        return `le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}`;
    }, []);

    const emitTyping = () => {
        socketRef.current?.emit("typing", {conversation_id: conversationId, user_id: user?.id});
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

        const fetchMessages = async () => {
            try {
                const res = await axiosInstance.get(`/chat/messages/${conversationId}`);
                dispatch({type: 'SET_MESSAGES', payload: res.data.messages});
                setPartner(res.data.partner);

                await axiosInstance.post(`/chat/conversations/${conversationId}/read`);
            } catch (err) {
                console.error("Erreur récupération ou marquage comme lu :", err);
            }
        };

        fetchMessages();
    }, [conversationId]);


    useEffect(() => {
        if (!conversationId || !socketRef.current) return;
        const socket = socketRef.current;

        const handleNewMessage = (message) => {
            if (parseInt(conversationId) === message.conversation_id) {
                const isMine = message.sender_id === user?.id;
                if (isMine) return;
                dispatch({
                    type: 'ADD_MESSAGE',
                    payload: {
                        id: message.id,
                        from: "other",
                        sender_id: message.sender_id,
                        deleted: false,
                        content: message.content,
                        timestamp: message.timestamp
                    }
                });
                axiosInstance.post(`/chat/conversations/${conversationId}/read`).catch(console.error);
            }
        };

        const handleDeletedMessage = (data) => {
            if (parseInt(conversationId) !== data.conversation_id) return;
            dispatch({
                type: 'SET_MESSAGES',
                payload: (prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === data.message_id
                            ? {
                                ...msg,
                                content: 'Message supprimé',
                                deleted: true,
                                deleted_at: data.deleted_at
                            }
                            : msg
                    ),
            });
        };

        socket.emit("join_conversation", {conversation_id: conversationId});
        socket.on("new_message", handleNewMessage);
        socket.on("typing", (data) => {
            if (data.conversation_id === conversationId) setTypingUser(true);
        });
        socket.on("stop_typing", (data) => {
            if (data.conversation_id === conversationId) setTypingUser(false);
        });
        socket.on("message_deleted", handleDeletedMessage);

        return () => {
            socket.emit("stop_typing", {conversation_id: conversationId, user_id: user?.id});
            socket.off("new_message", handleNewMessage);
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("message_deleted", handleDeletedMessage);
        };
    }, [conversationId, user, socketRef]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        try {
            const res = await axiosInstance.post(`/chat/messages/${conversationId}`, {content: input});

            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    ...res.data,
                    from: "me",
                    sender_id: user?.id,
                    deleted: false
                }
            });
            setInput('');
            socketRef.current?.emit("stop_typing", {conversation_id: conversationId, user_id: user?.id});
            emitStopTyping.cancel();
            isCurrentlyTyping.current = false;
        } catch (err) {
            console.error(err);
        }
    };

    const confirmDeleteMessage = async () => {
        if (messageToDelete === null) return;
        setDeleting(true);
        try {
            await axiosInstance.delete(`/chat/messages/${messageToDelete}`);
            dispatch({
                type: 'SET_MESSAGES',
                payload: messages.map((msg) =>
                    msg.id === messageToDelete
                        ? {
                            ...msg,
                            content: 'Message supprimé',
                            deleted: true,
                            deleted_at: new Date().toISOString()
                        }
                        : msg
                ),
            });
        } catch (err) {
            console.error("Erreur suppression message :", err);
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
            setMessageToDelete(null);
        }
    };

    const handleScroll = useCallback((e) => {
        const {scrollHeight, scrollTop, clientHeight} = e.target;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setShowScrollToBottom((prev) => {
            const shouldShow = distanceFromBottom > 200;
            return prev !== shouldShow ? shouldShow : prev;
        });
    }, []);

    const scrollToBottom = () => {
        virtuosoRef.current?.scrollToIndex({index: messages.length - 1, behavior: 'smooth'});
    };

    return (
        <PageTransition>
            <Box p="md">
                <Group position="apart" mb="xs">
                    <Group spacing="sm">
                        <BackButton onClick={() => {
                            socketRef.current?.emit("stop_typing", {
                                conversation_id: conversationId,
                                user_id: user?.id
                            });
                            navigate(-1);
                        }}/>
                        <Title order={3}>{partner ? `${partner.firstname} ${partner.lastname}` : "Conversation"}</Title>
                    </Group>
                </Group>

                <TypingIndicator typingUser={typingUser}/>

                <Paper
                    shadow="xs"
                    p="sm"
                    withBorder
                    style={{height: 400, display: "flex", flexDirection: "column", position: "relative"}}
                >
                    <Virtuoso
                        ref={virtuosoRef}
                        style={{flex: 1}}
                        data={messages}
                        followOutput="auto"
                        overscan={20}
                        itemContent={(index, msg) => (
                            <MessageItem
                                msg={msg}
                                isHovered={hoveredMessageId === msg.id}
                                onHover={setHoveredMessageId}
                                onUnhover={() => setHoveredMessageId(null)}
                                onDeleteClick={(id) => {
                                    setMessageToDelete(id);
                                    setConfirmDeleteOpen(true);
                                }}
                                formatTimestamp={formatTimestamp}
                                isDark={isDark}
                                theme={theme}
                            />
                        )}
                        onScroll={handleScroll}
                    />

                    {showScrollToBottom && (
                        <ActionIcon
                            onClick={scrollToBottom}
                            variant="filled"
                            color="blue"
                            radius="xl"
                            size="lg"
                            style={{
                                position: 'absolute',
                                bottom: 80,
                                right: "50%",
                                zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            <IconArrowDown size={20}/>
                        </ActionIcon>
                    )}


                    <Group mt="xs" spacing={4} align="flex-end" style={{width: '100%'}}>
                        <Box style={{flexGrow: 1}}>
                            <Input
                                placeholder="Votre message..."
                                value={input}
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
                                        socketRef.current?.emit("stop_typing", {
                                            conversation_id: conversationId,
                                            user_id: user?.id,
                                        });
                                        isCurrentlyTyping.current = false;
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                style={{width: '100%'}}
                            />
                        </Box>
                        <Box mt={4} pb={2}>
                            <IconSend
                                onClick={() => {
                                    if (input.trim()) sendMessage();
                                }}
                                size={24}
                                style={{
                                    cursor: input.trim() ? "pointer" : "not-allowed",
                                    color: input.trim() ? theme.colors.blue[6] : "gray",
                                }}
                                title={input.trim() ? "Envoyer" : "Saisissez un message"}
                                stroke={1.5}
                            />
                        </Box>
                    </Group>

                </Paper>
            </Box>

            <ConfirmModal
                opened={confirmDeleteOpen}
                onClose={() => {
                    setConfirmDeleteOpen(false);
                    setMessageToDelete(null);
                }}
                onConfirm={confirmDeleteMessage}
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                loading={deleting}
                title="Supprimer ce message ?"
            >
                Ce message sera marqué comme supprimé et ne pourra pas être restauré.
            </ConfirmModal>
        </PageTransition>
    );
}