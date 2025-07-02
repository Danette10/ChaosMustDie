import {motion} from 'framer-motion';
import {Text} from '@mantine/core';

/**
 * Props du composant TypingIndicator.
 *
 * @typedef {Object} TypingIndicatorProps
 * @property {boolean} typingUser - Indique si un utilisateur est en train d'écrire.
 */
interface TypingIndicatorProps {
    typingUser: boolean;
}

/**
 * Composant TypingIndicator.
 *
 * Ce composant affiche une animation indiquant qu'un utilisateur est en train d'écrire.
 * Si aucun utilisateur n'est en train d'écrire, le composant ne s'affiche pas.
 *
 * @param {TypingIndicatorProps} props - Les propriétés du composant TypingIndicator.
 * @returns {JSX.Element | null} Le composant TypingIndicator ou null si aucun utilisateur n'écrit.
 */
export const TypingIndicator = ({typingUser}: TypingIndicatorProps) => {
    if (!typingUser) return null;

    return (
        <motion.div
            animate={{opacity: [0.5, 1, 0.5]}}
            transition={{repeat: Infinity, duration: 1}}
        >
            <Text size="sm" c="dimmed" mb="sm">
                En train d’écrire...
            </Text>
        </motion.div>
    );
};