import React, {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import {debounce} from 'lodash';
import {useNavigate, useParams} from 'react-router-dom';
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Input,
    Paper,
    Title,
    useComputedColorScheme,
    useMantineTheme
} from '@mantine/core';
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
import {Loader} from "../../components/Loader";
import EndAuditModal from "../../modals/EndAuditModal";
import {notifications} from "@mantine/notifications";
import {UserTypeEnum} from "../../enum/UserTypeEnum";

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
    const [followOutput, setFollowOutput] = useState<'smooth' | false>('smooth');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [auditStatus, setAuditStatus] = useState<string | null>(null);

    const prevLengthRef = useRef(0);
    const isAtBottomRef = useRef(true);

    const LIMIT = 20;
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [firstItemIndex, setFirstItemIndex] = useState(0);
    const [audit, setAudit] = useState(null);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [endAuditLoading, setEndAuditLoading] = useState(false);
    const lastScrollTopRef = useRef(0);

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

            setAudit({...audit, status: "completed"});
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
        formData.append("conversation_id", conversationId || "");
        formData.append("action", action);

        try {
            const res = await axiosInstance.patch("/audit/respond", formData);

            // ✅ Mise à jour locale immédiate
            if (action === "accept" && res.data?.audit_id) {
                setAudit({id: res.data.audit_id, status: "in_progress"});
            } else if (action === "refuse") {
                setAudit(null);
            }

            setAuditStatus(action === "accept" ? "in_progress" : null);
        } catch (err) {
            console.error(`Erreur lors de l’audit ${action}:`, err);
        }
    };

    const handleRequestAudit = async () => {
        try {
            await axiosInstance.post("/audit/request", {
                auditor_id: partner?.id,
                company_id: user?.company?.id,
                conversation_id: conversationId
            });
            const res = await axiosInstance.get("/audit/status", {
                params: {auditor_id: partner?.id, company_id: user?.company?.id}
            });
            setAudit({status: "pending"});
            setInput('');
            socketRef.current?.emit("stop_typing", {conversation_id: conversationId, user_id: user?.id});
            emitStopTyping.cancel();
            isCurrentlyTyping.current = false;
        } catch (err) {
            console.error(err);
        }
    };

    const loadMessages = async (initial = false) => {
        if (!conversationId) return;

        try {
            const res = await axiosInstance.get(`/chat/messages/${conversationId}`, {
                params: {offset, limit: LIMIT}
            });

            const newMessages = res.data.messages;

            setOffset((prev) => prev + newMessages.length);
            setHasMore(res.data.has_more);
            setPartner(res.data.partner);
            setAudit(res.data.audit);

            if (initial) {
                // ✅ Chargement initial
                setFirstItemIndex(0);
                dispatch({
                    type: 'SET_MESSAGES',
                    payload: () => newMessages
                });

                setTimeout(() => {
                    virtuosoRef.current?.scrollToIndex({
                        index: newMessages.length - 1,
                        behavior: 'auto'
                    });
                }, 50);
            } else {
                // ✅ Chargement supplémentaire (scroll vers le haut)

                // ⚠️ On attend le DOM pour récupérer le scroll container
                requestAnimationFrame(() => {
                    const scrollContainer = containerRef.current?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null;

                    if (!scrollContainer) {
                        console.warn("⚠️ scrollContainer introuvable");
                        return;
                    }

                    const prevScrollHeight = scrollContainer.scrollHeight;
                    const prevScrollTop = scrollContainer.scrollTop;

                    // 1. Ajout des nouveaux messages (prepend)
                    dispatch({
                        type: 'SET_MESSAGES',
                        payload: (prev) => [...newMessages, ...prev]
                    });

                    // 2. Mise à jour de l’index
                    setFirstItemIndex((prev) => prev + newMessages.length);

                    // 3. Compensation du scroll
                    requestAnimationFrame(() => {
                        const updatedScrollContainer = containerRef.current?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null;
                        if (!updatedScrollContainer) return;

                        const newScrollHeight = updatedScrollContainer.scrollHeight;
                        const delta = newScrollHeight - prevScrollHeight;
                        updatedScrollContainer.scrollTop = prevScrollTop + delta;
                    });
                });
            }

            await axiosInstance.post(`/chat/conversations/${conversationId}/read`);
        } catch (err) {
            console.error("Erreur récupération ou marquage comme lu :", err);
        }
    };


    useEffect(() => {
        setOffset(0);
        setFirstItemIndex(0);
        loadMessages(true);
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

        const handleAuditRequested = (data) => {
            if (data.auditor_id === user?.id || data.company_id === user?.company?.id) {
                setAudit({status: "pending"});
            }

            const isFromMe = data.emitted_by === user?.id;
            
            if (!isFromMe) {
                notifications.show({
                    title: "Nouvelle demande d'audit",
                    message: "Vous avez reçu une nouvelle demande d’audit.",
                    color: "yellow",
                    icon: <IconSend size={16}/>,
                });
            } else {
                notifications.show({
                    title: "Demande d’audit envoyée",
                    message: "Votre demande d’audit a été envoyée.",
                    color: "green",
                });
            }
        };

        const handleAuditAccepted = (data) => {
            if (data.auditor_id === user?.id || data.company_id === user?.company?.id) {
                setAudit({id: data.audit_id, status: "in_progress"});
            }

            notifications.show({
                title: "Audit accepté",
                message: "Votre demande d’audit a été acceptée.",
                color: "green",
            });
        };

        const handleAuditRefused = (data) => {
            if (data.auditor_id === partner?.id && data.company_id === user?.company?.id) {
                setAudit({id: data.audit_id, status: "refused"});
            }

            notifications.show({
                title: "Audit refusé",
                message: "Votre demande d’audit a été refusée.",
                color: "red",
            });
        };

        const handleAuditFinished = (data) => {
            if (data.auditor_id === user?.id || data.company_id === user?.company?.id) {
                setAudit({id: data.audit_id, status: "completed"});
            }

            notifications.show({
                title: "Audit terminé",
                message: "L’audit a été terminé.",
                color: "blue",
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

        socket.on("audit_requested", handleAuditRequested);
        socket.on("audit_accepted", handleAuditAccepted);
        socket.on("audit_refused", handleAuditRefused);
        socket.on("audit_finished", handleAuditFinished);

        return () => {
            socket.emit("stop_typing", {conversation_id: conversationId, user_id: user?.id});
            socket.off("new_message", handleNewMessage);
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("message_deleted", handleDeletedMessage);
            socket.off("audit_requested", handleAuditRequested);
            socket.off("audit_accepted", handleAuditAccepted);
            socket.off("audit_refused", handleAuditRefused);
            socket.off("audit_finished", handleAuditFinished);
        };
    }, [conversationId, user, socketRef]);

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
                    params: {auditor_id, company_id},
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
        const {scrollTop, scrollHeight, clientHeight} = e.target;

        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setShowScrollToBottom((prev) => {
            const shouldShow = distanceFromBottom > 200;
            return prev !== shouldShow ? shouldShow : prev;
        });

        const isScrollingUp = scrollTop < lastScrollTopRef.current;
        lastScrollTopRef.current = scrollTop;

        // ⚠️ Scroll haut + direction vers le haut + proche du haut
        if (isScrollingUp && scrollTop < 200 && hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            loadMessages().finally(() => {
                setTimeout(() => setIsLoadingMore(false), 250);
            });
        }
    }, [hasMore, isLoadingMore, loadMessages]);


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
                        <Group spacing="sm">
                            {user?.user_type === UserTypeEnum.COMPANY && (
                                <>
                                    {audit?.status === "in_progress" && (
                                        <Badge color="teal">Audit en cours</Badge>
                                    )}

                                    {audit?.status === "pending" && (
                                        <Badge color="yellow">Demande envoyée</Badge>
                                    )}

                                    {audit?.status === "completed" && (
                                        <Badge color="gray">Audit terminé</Badge>
                                    )}

                                    {(!audit || audit?.status === "completed" || audit?.status === "failed") && (
                                        <Button size="xs" variant="light" onClick={handleRequestAudit}>
                                            Demander un audit
                                        </Button>
                                    )}
                                </>
                            )}

                            {user?.user_type === UserTypeEnum.AUDITOR && (
                                <>
                                    {audit?.status === "pending" && (
                                        <Group spacing={4}>
                                            <Button
                                                size="xs"
                                                color="green"
                                                variant="light"
                                                onClick={() => handleAuditResponse("accept")}
                                            >
                                                Accepter l'audit
                                            </Button>
                                            <Button
                                                size="xs"
                                                color="red"
                                                variant="light"
                                                onClick={() => handleAuditResponse("refuse")}
                                            >
                                                Refuser l'audit
                                            </Button>
                                        </Group>
                                    )}

                                    {audit?.status === "in_progress" && (
                                        <Group spacing={8}>
                                            <Badge color="teal">Audit en cours</Badge>
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="blue"
                                                onClick={() => setShowFinishModal(true)}
                                            >
                                                Terminer
                                            </Button>
                                        </Group>
                                    )}

                                    {audit?.status === "completed" && (
                                        <Badge color="gray">Audit terminé</Badge>
                                    )}
                                </>
                            )}
                        </Group>

                    </Group>
                </Group>

                <TypingIndicator typingUser={typingUser}/>

                <Paper
                    ref={containerRef}  // ✅ Pour accéder au scroll container plus tard
                    shadow="xs"
                    p="sm"
                    withBorder
                    style={{height: 400, display: "flex", flexDirection: "column", position: "relative"}}
                >
                    <Virtuoso
                        ref={virtuosoRef}
                        style={{flex: 1}}
                        data={messages}
                        firstItemIndex={firstItemIndex}
                        followOutput={followOutput}
                        atBottomStateChange={(atBottom) => {
                            isAtBottomRef.current = atBottom;
                            setShowScrollToBottom(!atBottom);
                            setFollowOutput(atBottom ? 'smooth' : false);
                        }}
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
                        components={{
                            Header: () => (
                                <>
                                    {isLoadingMore && (
                                        <Box p="xs" sx={{display: 'flex', justifyContent: 'center'}}>
                                            <Loader></Loader>
                                        </Box>
                                    )}
                                    {!hasMore && (
                                        <Box p="xs" sx={{display: 'flex', justifyContent: 'center'}}>
          <span style={{fontSize: 13, fontStyle: 'italic', color: theme.colors.gray[5]}}>
            Début de la conversation
          </span>
                                        </Box>
                                    )}
                                </>
                            )
                        }}

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

            <EndAuditModal
                opened={showFinishModal}
                onClose={() => setShowFinishModal(false)}
                onSubmit={handleAuditEnd}
                loading={endAuditLoading}
            />

        </PageTransition>
    );
}