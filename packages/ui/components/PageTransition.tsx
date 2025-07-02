import {motion} from "framer-motion"
import * as React from 'react';

/**
 * PageTransition Component
 *
 * This component provides a smooth transition effect for pages using Framer Motion.
 * It animates the opacity and horizontal position of its children during mounting, updating, and unmounting.
 *
 * @param {Object} props - Props for the component.
 * @param {React.ReactNode} [props.children] - The content to be wrapped and animated within the transition.
 * @returns {JSX.Element} The rendered component with transition effects.
 */
export default function PageTransition({children}: { children?: React.ReactNode }) {
    return (
        <motion.div
            initial={{opacity: 0, x: 50}} // Initial state: transparent and shifted to the right.
            animate={{opacity: 1, x: 0}} // Animation state: fully visible and centered.
            exit={{opacity: 0, x: -50}} // Exit state: transparent and shifted to the left.
            transition={{duration: 0.3, ease: "easeInOut"}} // Transition configuration: duration and easing.
            className="h-full" // CSS class for full height styling.
        >
            {children} {/* Renders the child elements within the animated container. */}
        </motion.div>
    )
}