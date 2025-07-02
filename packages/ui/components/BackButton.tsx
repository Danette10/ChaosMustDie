import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {ActionIcon, useComputedColorScheme} from "@mantine/core";

/**
 * Props for the BackButton component.
 *
 * @interface BackButtonProps
 * @property {() => void} [onClick] - Optional callback function triggered when the button is clicked.
 */
type BackButtonProps = {
    onClick?: () => void;
};

/**
 * BackButton Component
 *
 * This component renders a button with a left arrow icon, allowing users to navigate back.
 * It supports both custom click handlers and default navigation behavior.
 *
 * @param {BackButtonProps} props - Props for the component.
 * @returns {JSX.Element} The rendered back button.
 */
export const BackButton = ({onClick}: BackButtonProps) => {
    const navigate = useNavigate(); // Hook for programmatic navigation.
    const colorScheme = useComputedColorScheme(); // Detects the current color scheme (light/dark).
    const isDark = colorScheme === "dark"; // Boolean indicating if the theme is dark.

    /**
     * Handles the button click event.
     * Executes the custom `onClick` handler if provided, otherwise navigates back.
     */
    const handleClick = () => {
        if (onClick) {
            onClick(); // Executes the custom click handler.
        } else {
            navigate(-1); // Navigates to the previous page.
        }
    };

    return (
        <ActionIcon
            onClick={handleClick} // Attaches the click handler.
            aria-label="Retour" // Accessibility label for the button.
            size="lg" // Sets the size of the button.
            variant="light" // Specifies the button variant.
            color={isDark ? "gray.4" : "gray.7"} // Adjusts the color based on the theme.
        >
            <ArrowLeft size={20} color={isDark ? "#fff" : "#000"}/> {/* Renders the left arrow icon. */}
        </ActionIcon>
    );
};