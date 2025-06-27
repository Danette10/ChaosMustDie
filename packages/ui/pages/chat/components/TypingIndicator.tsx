import {motion} from 'framer-motion';
import {Text} from '@mantine/core';

interface TypingIndicatorProps {
    typingUser: boolean;
}

export const TypingIndicator = ({typingUser}: TypingIndicatorProps) => {
    if (!typingUser) return null;

    return (
        <motion.div
            animate={{opacity: [0.5, 1, 0.5]}}
            transition={{repeat: Infinity, duration: 1}}
        >
            <Text size="sm" color="dimmed" mb="sm">
                En train d’écrire...
            </Text>
        </motion.div>
    );
};
