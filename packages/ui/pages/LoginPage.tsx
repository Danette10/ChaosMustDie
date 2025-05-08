import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { BackButton } from "../components/BackButton";
import axiosInstance from "../utils/axiosInstance";
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title
} from "@mantine/core";

export default function LoginPage() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      const { user, token } = res.data;

      if (!token || !user) throw new Error("Réponse invalide");

      localStorage.setItem("access_token", token);
      setUser(user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants invalides");
    }
  };

  return (
      <Center h="100vh" bg="gray.0" px="md">
        <Paper shadow="md" radius="md" p="xl" w={350} withBorder>
          <Group justify="space-between" align="center" mb="md">
            <BackButton />
            <Title order={2} ta="center" m={0}>
              Connexion
            </Title>
            <Box w={32} />
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
            </Stack>
          </form>
        </Paper>
      </Center>
  );
};
