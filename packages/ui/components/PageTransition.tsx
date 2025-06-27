import {motion} from "framer-motion"

export default function PageTransition({children}: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{opacity: 0, x: 50}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -50}}
            transition={{duration: 0.3, ease: "easeInOut"}}
            className="h-full"
        >
            {children}
        </motion.div>
    )
}
