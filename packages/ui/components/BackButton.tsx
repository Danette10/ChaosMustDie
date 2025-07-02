import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {ActionIcon, useComputedColorScheme} from "@mantine/core";

type BackButtonProps = {
    onClick?: () => void;
};

export const BackButton = ({onClick}: BackButtonProps) => {
    const navigate = useNavigate();
    const colorScheme = useComputedColorScheme();
    const isDark = colorScheme === "dark";

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <ActionIcon
            onClick={handleClick}
            aria-label="Retour"
            size="lg"
            variant="light"
            color={isDark ? "gray.4" : "gray.7"}
        >
            <ArrowLeft size={20} color={isDark ? "#fff" : "#000"}/>
        </ActionIcon>
    );
};
