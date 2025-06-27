import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {ActionIcon, useComputedColorScheme} from "@mantine/core";

export const BackButton = () => {
    const navigate = useNavigate();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <ActionIcon
            onClick={() => navigate(-1)}
            aria-label="Retour"
            size="lg"
            variant="light"
            color={isDark ? "gray.4" : "gray.7"}
        >
            <ArrowLeft size={20} color={isDark ? "#fff" : "#000"}/>
        </ActionIcon>
    );
};
