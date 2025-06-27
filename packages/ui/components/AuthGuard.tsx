import {useUser} from "../context/UserContext";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Center, Loader, Text} from "@mantine/core";

export const AuthGuard = ({children}: { children: React.ReactNode }) => {
    const {user, loading} = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <Center h="100vh">
                <Loader/>
            </Center>
        );
    }

    if (!user) {
        return (
            <Center h="100vh">
                <Text>Redirection vers la page de connexion...</Text>
            </Center>
        );
    }

    return <>{children}</>;
};
