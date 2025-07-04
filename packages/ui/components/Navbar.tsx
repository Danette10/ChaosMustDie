import {useLocation, useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext";
import axiosInstance from "../utils/axiosInstance";
import {ActionIcon, Button, Group, Paper, useComputedColorScheme, useMantineColorScheme} from "@mantine/core";
import {IconMoon, IconSun} from "@tabler/icons-react";

/**
 * Navbar Component
 *
 * This component renders a navigation bar with links to different sections of the application.
 * It includes buttons for navigation, a logout button, and a toggle for the color scheme.
 *
 * @returns {JSX.Element} The rendered navigation bar component.
 */
export const Navbar = () => {
    const {setUser} = useUser(); // Retrieves the user context and a function to update the user state.
    const navigate = useNavigate(); // Hook for programmatic navigation.
    const location = useLocation(); // Retrieves the current location object from React Router.
    const {setColorScheme} = useMantineColorScheme(); // Function to update the color scheme.
    const computedColorScheme = useComputedColorScheme('light', {getInitialValueInEffect: true}); // Detects the current color scheme.

    /**
     * Handles the logout process.
     * Sends a logout request to the server, clears the access token, updates the user state, and redirects to the login page.
     */
    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout"); // Sends a logout request to the server.
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err); // Logs any errors during logout.
        } finally {
            localStorage.removeItem("access_token"); // Removes the access token from local storage.
            setUser(null); // Updates the user state to null.
            navigate("/login", {replace: true}); // Redirects to the login page.
        }
    };

    return (
        <Paper shadow="sm" px="md" py="sm" radius={0} style={{paddingRight: "0"}}>
            <Group justify="space-between" align="center" style={{justifyContent: "space-between"}}>
                <Group gap="xs">
                    {/* Button to navigate to the dashboard */}
                    <Button
                        size="xs"
                        variant={location.pathname === "/dashboard" ? "filled" : "subtle"}
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </Button>

                    {/* Button to navigate to the profile page */}
                    <Button
                        size="xs"
                        variant={location.pathname === "/profile" ? "filled" : "subtle"}
                        onClick={() => navigate("/profile")}
                    >
                        Profil
                    </Button>

                    {/* Button to navigate to the chat section */}
                    <Button
                        size="xs"
                        variant={location.pathname.startsWith("/chat") ? "filled" : "subtle"}
                        onClick={() => navigate("/chat")}
                    >
                        Chat
                    </Button>

                    {/* Button to navigate to the audits section */}
                    <Button
                        size="xs"
                        variant={location.pathname.startsWith("/audit") ? "filled" : "subtle"}
                        onClick={() => navigate("/audit")}
                    >
                        Audits
                    </Button>

                    {/* Button to handle user logout */}
                    <Button size="xs" color="red" onClick={handleLogout}>
                        Déconnexion
                    </Button>
                </Group>
                <ActionIcon
                    onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                    variant="default"
                    size="xl"
                    aria-label="Toggle color scheme"
                >
                    {/* Icon to toggle between light and dark color schemes */}
                    {computedColorScheme === 'dark' ? (
                        <IconSun stroke={1.5}/>
                    ) : (
                        <IconMoon stroke={1.5}/>
                    )}
                </ActionIcon>
            </Group>
        </Paper>
    );
};