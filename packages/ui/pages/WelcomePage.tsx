import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Box, Button, Center, Stack, Text, Title} from "@mantine/core";
import PageTransition from "../components/PageTransition";
import {useUser} from "../context/UserContext";

/**
 * Composant WelcomePage.
 *
 * Ce composant représente la page d'accueil pour les utilisateurs non connectés.
 * Il affiche des options pour se connecter ou s'inscrire, et redirige les utilisateurs connectés
 * vers le tableau de bord.
 *
 * @returns {JSX.Element} Le composant WelcomePage.
 */
export default function WelcomePage() {
    const {user, loading} = useUser(); // Récupère les informations de l'utilisateur et l'état de chargement depuis le contexte.
    const navigate = useNavigate(); // Hook pour naviguer entre les pages.

    /**
     * Effet pour rediriger les utilisateurs connectés vers le tableau de bord.
     * Ce hook s'exécute lorsque l'état de chargement ou les informations utilisateur changent.
     */
    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    return (
        <PageTransition>
            <Box h="100vh" px="md">
                <Center h="100%">
                    <Stack align="center" gap="md">
                        <Title order={2}>Bienvenue</Title>
                        <Text c="dimmed">Veuillez vous connecter ou créer un compte.</Text>

                        <Button fullWidth onClick={() => navigate("/login")}>
                            Se connecter
                        </Button>

                        <Button variant="outline" fullWidth onClick={() => navigate("/register")}>
                            S’inscrire
                        </Button>

                    </Stack>
                </Center>
            </Box>
        </PageTransition>
    );
};