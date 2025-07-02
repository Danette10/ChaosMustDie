import {ActionIcon, Box, Text, Tooltip} from '@mantine/core';
import {IconTrash} from '@tabler/icons-react';
import {Message} from "./messageReducer";

/**
 * Props du composant MessageItem.
 *
 * @typedef {Object} MessageItemProps
 * @property {Message & {from: 'me' | 'other'}} msg - Le message à afficher, avec une indication de l'expéditeur.
 * @property {boolean} isHovered - Indique si le message est actuellement survolé.
 * @property {(id: number) => void} onHover - Fonction appelée lorsque le message est survolé.
 * @property {() => void} onUnhover - Fonction appelée lorsque le survol du message est terminé.
 * @property {(id: number) => void} onDeleteClick - Fonction appelée lorsque l'utilisateur clique pour supprimer le message.
 * @property {(ts: string | number) => string} formatTimestamp - Fonction pour formater l'horodatage du message.
 * @property {boolean} isDark - Indique si le thème actuel est sombre.
 * @property {any} theme - Objet représentant le thème actuel.
 */
export interface MessageItemProps {
    msg: Message & { from: 'me' | 'other' };
    isHovered: boolean;
    onHover: (id: number) => void;
    onUnhover: () => void;
    onDeleteClick: (id: number) => void;
    formatTimestamp: (ts: string | number) => string;
    isDark: boolean;
    theme: any;
}

/**
 * Composant MessageItem.
 *
 * Ce composant représente un élément de message dans une conversation. Il affiche le contenu du message,
 * son horodatage, et permet de supprimer un message si l'utilisateur est l'expéditeur.
 *
 * @param {MessageItemProps} props - Les propriétés du composant MessageItem.
 * @returns {JSX.Element} Le composant MessageItem.
 */
export const MessageItem = ({
                                msg,
                                isHovered,
                                onHover,
                                onUnhover,
                                onDeleteClick,
                                formatTimestamp,
                                isDark,
                                theme,
                            }: MessageItemProps) => {
    return (
        <Box key={msg.id} px="xs" py={4}>
            <Box style={{display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start'}}>
                <Box
                    p="sm"
                    onMouseEnter={() => onHover(msg.id)}
                    onMouseLeave={onUnhover}
                    bg={
                        msg.from === 'me'
                            ? isDark
                                ? 'blue.9'
                                : 'blue.0'
                            : isDark
                                ? theme.colors.dark[5]
                                : theme.colors.gray[1]
                    }
                    style={{
                        borderRadius: 16,
                        position: 'relative',
                        wordBreak: 'break-word',
                        maxWidth: 300,
                    }}
                >
                    {isHovered && msg.from === 'me' && !msg.deleted && (
                        <Tooltip label="Supprimer le message" position="top-end">
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => onDeleteClick(msg.id)}
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    zIndex: 2,
                                    transition: 'opacity 0.2s ease',
                                }}
                            >
                                <IconTrash size={16}/>
                            </ActionIcon>
                        </Tooltip>
                    )}
                    <Text
                        style={{
                            fontStyle: msg.deleted ? 'italic' : 'normal',
                            color: msg.deleted ? theme.colors.gray[6] : undefined,
                        }}
                    >
                        {msg.deleted && !msg.content ? "Message supprimé" : msg.content}
                    </Text>
                    <Text size="sm" mt={4}>
                        <em>
                            {msg.deleted && msg.deleted_at
                                ? `Supprimé le ${formatTimestamp(msg.deleted_at)}`
                                : formatTimestamp(msg.timestamp)}
                        </em>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};