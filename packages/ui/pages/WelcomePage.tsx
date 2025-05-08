import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Center, Stack, Text, Title, Box } from "@mantine/core";
import PageTransition from "../components/PageTransition";
import { useUser } from "../context/UserContext";

export default function  WelcomePage () {
    const { user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    return (
        <PageTransition>
            <Box h="100vh" bg="gray.0" px="md">
                <Center h="100%">
                    <Stack align="center" spacing="md">
                        <Title order={2}>Bienvenue</Title>
                        <Text color="dimmed">Veuillez vous connecter ou créer un compte.</Text>

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
