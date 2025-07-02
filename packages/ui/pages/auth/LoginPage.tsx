import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useUser} from "ui/context/UserContext";
import {BackButton} from "ui/components/BackButton";
import axiosInstance from "../../utils/axiosInstance";
import {Alert, Box, Button, Center, Group, Paper, PasswordInput, Stack, Text, TextInput, Title} from "@mantine/core";

export default function LoginPage() {
    const {setUser} = useUser();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axiosInstance.post("/auth/login", {email, password});

            const {user, access_token} = res.data;

            if (!access_token || !user) {
                throw new Error("Réponse invalide du serveur");
            }

            const token = access_token.replace("Bearer ", "");
            localStorage.setItem("access_token", token);
            localStorage.setItem("token_expiry", (Date.now() + 12 * 60 * 60 * 1000).toString()); // 12h

            setUser(user);
            navigate("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Identifiants invalides");
        }
    };

    return (
        <Center h="100vh" px="md">
            <Paper shadow="md" radius="md" p="xl" style={{width: "100%"}}>
                <Group justify="space-between" align="center" mb="md">
                    <BackButton/>
                    <Title order={2} ta="center" m={0}>
                        Connexion
                    </Title>
                    <Box/>
                </Group>

                {error && (
                    <Alert color="red" mb="sm">
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label="Email"
                            placeholder="Votre email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            required
                        />

                        <PasswordInput
                            label="Mot de passe"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            required
                        />

                        <Button type="submit" fullWidth>
                            Se connecter
                        </Button>

                        <Text size="sm" ta="center" mt="sm">
                            <Link to="/forgot-password">Mot de passe oublié ?</Link>
                        </Text>
                        <Text size="sm" ta="center">
                            Pas encore de compte ?{" "}
                            <Link to="/register">Inscrivez-vous ici</Link>
                        </Text>
                    </Stack>
                </form>
            </Paper>
        </Center>
    );
};
