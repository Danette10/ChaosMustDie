import { useState } from "react";
import {
    Box,
    Button,
    Paper,
    TextInput,
    PasswordInput,
    Tabs,
    Alert,
    Stack,
    Title,
    Progress,
    FloatingIndicator,
    Group,
    Container
} from "@mantine/core";
import { BackButton } from "../components/BackButton";
import axiosInstance from "../utils/axiosInstance";
import classes from "../styles/RegisterPage.module.css";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<"auditor" | "company">("auditor");

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
        siren: "",
        name_company: "",
        address: "",
        contact_email: "",
        link: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
    const [listRef, setListRef] = useState<HTMLDivElement | null>(null);

    const setControlRef = (val: string) => (node: HTMLButtonElement) => {
        controlsRefs[val] = node;
        setControlsRefs(controlsRefs);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
        return strength;
    };

    const isPasswordValid = () => getPasswordStrength(form.password) === 100;
    const isConfirmValid = form.password === form.confirm_password;

    const handleRegister = async () => {
        if (!isPasswordValid()) {
            setError("Le mot de passe est trop faible.");
            return;
        }
        if (!isConfirmValid) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        const endpoint = `/auth/register/${tab}`;
        const payload =
            tab === "auditor"
                ? {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    phone_number: form.phone_number,
                    password: form.password
                }
                : { ...form };

        try {
            await axiosInstance.post(endpoint, payload);
            setSuccess("Inscription réussie");
            setError("");
            localStorage.setItem("pending_confirmation_email", form.email);
            setTimeout(() => navigate("/confirm-code"), 500);
        } catch {
            setError("Erreur pendant l'inscription");
            setSuccess("");
        }
    };

    return (
        <Container h="100%" px="md" py="lg">
            <Paper withBorder radius="md" p={0} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Tabs
                    value={tab}
                    onChange={(v) => setTab(v as "auditor" | "company")}
                    variant="none"
                    keepMounted={false}
                    style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                    <Box p="md" bg="gray.1">
                        <Group justify="space-between" align="center" mt="md">
                            <BackButton />
                            <Title order={3} mb={0}>
                                Inscription
                            </Title>
                            <div style={{ width: 32 }} />
                        </Group>
                        <Tabs.List ref={setListRef} className={classes.list} mt="md" mb="md">
                            <Tabs.Tab value="auditor" ref={setControlRef("auditor")} className={classes.tab} style={{ width: "50%", justifyContent: "center" }}>
                                Auditeur
                            </Tabs.Tab>
                            <Tabs.Tab value="company" ref={setControlRef("company")} className={classes.tab} style={{ width: "50%", justifyContent: "center" }}>
                                Entreprise
                            </Tabs.Tab>
                            {listRef && controlsRefs[tab] && (
                                <FloatingIndicator target={controlsRefs[tab]} parent={listRef} className={classes.indicator} />
                            )}
                        </Tabs.List>
                    </Box>

                    <Box px="md" py="sm">
                        <Tabs.Panel value="auditor">
                            <Stack>
                                <TextInput name="first_name" label="Prénom" value={form.first_name} onChange={handleChange} required />
                                <TextInput name="last_name" label="Nom" value={form.last_name} onChange={handleChange} required />
                                <TextInput name="email" label="Email" type="email" value={form.email} onChange={handleChange} required />
                                <TextInput name="phone_number" label="Téléphone" type="tel" value={form.phone_number} onChange={handleChange} required />
                                <PasswordInput name="password" label="Mot de passe" value={form.password} onChange={handleChange} required />
                                <Progress value={getPasswordStrength(form.password)} color={getPasswordStrength(form.password) === 100 ? "green" : "red"} />
                                <PasswordInput name="confirm_password" label="Confirmer le mot de passe" value={form.confirm_password} onChange={handleChange} error={!isConfirmValid && form.confirm_password !== ""} required />
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="company">
                            <Stack>
                                <TextInput name="first_name" label="Prénom" value={form.first_name} onChange={handleChange} required />
                                <TextInput name="last_name" label="Nom" value={form.last_name} onChange={handleChange} required />
                                <TextInput name="email" label="Email" type="email" value={form.email} onChange={handleChange} required />
                                <TextInput name="phone_number" label="Téléphone" type="tel" value={form.phone_number} onChange={handleChange} required />
                                <PasswordInput name="password" label="Mot de passe" value={form.password} onChange={handleChange} required />
                                <Progress value={getPasswordStrength(form.password)} color={getPasswordStrength(form.password) === 100 ? "green" : "red"} />
                                <PasswordInput name="confirm_password" label="Confirmer le mot de passe" value={form.confirm_password} onChange={handleChange} error={!isConfirmValid && form.confirm_password !== ""} required />
                                <TextInput name="siren" label="SIREN" value={form.siren} onChange={handleChange} required />
                                <TextInput name="name_company" label="Nom de l'entreprise" value={form.name_company} onChange={handleChange} required />
                                <TextInput name="address" label="Adresse" value={form.address} onChange={handleChange} required/>
                                <TextInput name="contact_email" label="Email de contact" type="email" value={form.contact_email} onChange={handleChange} required />
                                <TextInput name="link" label="Lien du site" value={form.link} onChange={handleChange} required />
                            </Stack>
                        </Tabs.Panel>

                        {error && <Alert color="red" mt="md">{error}</Alert>}
                        {success && <Alert color="green" mt="md">{success}</Alert>}
                    </Box>

                    <Box p="md">
                        <Button fullWidth onClick={handleRegister}>
                            S’inscrire
                        </Button>
                    </Box>
                </Tabs>
            </Paper>
        </Container>
    );
};
