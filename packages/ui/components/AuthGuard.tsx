import {useUser} from "../context/UserContext";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Center, Loader, Text} from "@mantine/core";

/**
 * AuthGuard Component
 *
 * This component ensures that only authenticated users can access its children.
 * If the user is not authenticated, it redirects them to the home page.
 * While authentication status is being determined, it displays a loader.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to render if the user is authenticated.
 * @returns {JSX.Element} The rendered component.
 */
export const AuthGuard = ({children}: { children: React.ReactNode }) => {
    const {user, loading} = useUser(); // Retrieves the user context and loading state.
    const navigate = useNavigate(); // Navigation hook for redirecting users.

    /**
     * Effect to handle redirection if the user is not authenticated.
     * Runs whenever the `loading` or `user` state changes.
     */
    useEffect(() => {
        if (!loading && !user) {
            navigate("/"); // Redirects to the home page if the user is not authenticated.
        }
    }, [loading, user, navigate]);

    // Displays a loader while the authentication status is being determined.
    if (loading) {
        return (
            <Center h="100vh">
                <Loader/>
            </Center>
        );
    }

    // Displays a message if the user is not authenticated and is being redirected.
    if (!user) {
        return (
            <Center h="100vh">
                <Text>Redirection vers la page de connexion...</Text>
            </Center>
        );
    }

    // Renders the child components if the user is authenticated.
    return <>{children}</>;
};