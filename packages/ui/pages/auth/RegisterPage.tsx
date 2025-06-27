import {useState} from "react";
import {Alert, Box, Button, Container, Divider, FloatingIndicator, Group, Paper, Tabs, Title} from "@mantine/core";
import {BackButton} from "../../components/BackButton";
import axiosInstance from "../../utils/axiosInstance";
import classes from "../../styles/RegisterPage.module.css";
import {useNavigate} from "react-router-dom";
import RegisterForm from "../../components/RegisterForm";

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

    const setControlRef = (val: string) => (node: HTMLButtonElement | null) => {
        if (controlsRefs[val] !== node) {
            setControlsRefs((prev) => ({...prev, [val]: node}));
        }
    };

    const handleRegister = async () => {
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
                : {...form};

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
            <Paper radius="md" p={0} style={{display: "flex", flexDirection: "column", height: "100%"}}>
                <Tabs
                    value={tab}
                    onChange={(v) => setTab(v as "auditor" | "company")}
                    variant="none"
                    keepMounted={false}
                    style={{flex: 1, display: "flex", flexDirection: "column"}}
                >
                    <Box p="md">
                        <Group justify="space-between" align="center" mt="md">
                            <BackButton/>
                            <Title order={3} mb={0}>
                                Inscription
                            </Title>
                            <div style={{width: 32}}/>
                        </Group>
                        <Tabs.List ref={setListRef} className={classes.list} mt="md" mb="md">
                            <Tabs.Tab value="auditor" ref={setControlRef("auditor")} className={classes.tab}
                                      style={{width: "50%", justifyContent: "center"}}>
                                Auditeur
                            </Tabs.Tab>
                            <Tabs.Tab value="company" ref={setControlRef("company")} className={classes.tab}
                                      style={{width: "50%", justifyContent: "center"}}>
                                Entreprise
                            </Tabs.Tab>
                            {listRef && controlsRefs[tab] && (
                                <FloatingIndicator target={controlsRefs[tab]} parent={listRef}
                                                   className={classes.indicator}/>
                            )}
                        </Tabs.List>
                        <Divider my="md"/>
                    </Box>

                    <Box px="md" py="sm">
                        <Tabs.Panel value="auditor">
                            <RegisterForm type="auditor" form={form} setForm={setForm}/>
                        </Tabs.Panel>

                        <Tabs.Panel value="company">
                            <RegisterForm type="company" form={form} setForm={setForm}/>
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
}
