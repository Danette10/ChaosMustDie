import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useUser} from "ui/context/UserContext";
import {BackButton} from "ui/components/BackButton";
import axiosInstance from "../../utils/axiosInstance";
import {Alert, Box, Button, Center, Group, Paper, PasswordInput, Stack, Text, TextInput, Title} from "@mantine/core";

/**
 * Composant LoginPage.
 *
 * Ce composant représente la page de connexion de l'application. Il permet à l'utilisateur
 * de saisir ses identifiants (email et mot de passe) pour se connecter. En cas de succès,
 * l'utilisateur est redirigé vers la page d'accueil. En cas d'échec, un message d'erreur est affiché.
 *
 * @returns {JSX.Element} Le composant LoginPage.
 */
export default function LoginPage() {
    const {setUser} = useUser(); // Hook pour définir les informations de l'utilisateur dans le contexte global.
    const navigate = useNavigate(); // Hook pour naviguer entre les pages.

    const [email, setEmail] = useState(""); // État pour stocker l'email saisi par l'utilisateur.
    const [password, setPassword] = useState(""); // État pour stocker le mot de passe saisi par l'utilisateur.
    const [error, setError] = useState(""); // État pour stocker le message d'erreur en cas de problème de connexion.

    /**
     * Fonction pour gérer la soumission du formulaire de connexion.
     *
     * @param {React.FormEvent} e - Événement de soumission du formulaire.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Envoi des identifiants à l'API pour authentification.
            const res = await axiosInstance.post("/auth/login", {email, password});

            const {user, access_token} = res.data;

            if (!access_token || !user) {
                throw new Error("Réponse invalide du serveur");
            }

            // Stockage du token d'accès et de sa date d'expiration dans le localStorage.
            const token = access_token.replace("Bearer ", "");
            localStorage.setItem("access_token", token);
            localStorage.setItem("token_expiry", (Date.now() + 12 * 60 * 60 * 1000).toString()); // 12h

            setUser(user); // Mise à jour du contexte utilisateur.
            navigate("/"); // Redirection vers la page d'accueil.
        } catch (err: any) {
            // Gestion des erreurs et affichage du message d'erreur.
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