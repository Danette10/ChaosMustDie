import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActionIcon, rem } from "@mantine/core";

export const BackButton = () => {
    const navigate = useNavigate();

    return (
        <ActionIcon
            variant="light"
            color="gray"
            onClick={() => navigate(-1)}
            aria-label="Retour"
            size="lg"
        >
            <ArrowLeft size={20} />
        </ActionIcon>
    );
};
