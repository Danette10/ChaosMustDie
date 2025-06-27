import {useLocation, useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext";
import axiosInstance from "../utils/axiosInstance";
import {ActionIcon, Button, Group, Paper, useComputedColorScheme, useMantineColorScheme} from "@mantine/core";
import {IconMoon, IconSun} from "@tabler/icons-react";

export const Navbar = () => {
    const {user, setUser} = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const {setColorScheme} = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', {getInitialValueInEffect: true});

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err);
        } finally {
            localStorage.removeItem("access_token");
            setUser(null);
            navigate("/login", {replace: true});
        }
    };

    return (
        <Paper shadow="sm" px="md" py="sm" radius={0} style={{paddingRight: "0"}}>
            <Group position="apart" align="center" style={{justifyContent: "space-between"}}>
                <Group spacing="xs">
                    <Button
                        size="xs"
                        variant={location.pathname === "/dashboard" ? "filled" : "subtle"}
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </Button>

                    <Button
                        size="xs"
                        variant={location.pathname === "/profile" ? "filled" : "subtle"}
                        onClick={() => navigate("/profile")}
                    >
                        Profil
                    </Button>

                    <Button
                        size="xs"
                        variant={location.pathname.startsWith("/chat") ? "filled" : "subtle"}
                        onClick={() => navigate("/chat")}
                    >
                        Chat
                    </Button>

                    <Button
                        size="xs"
                        variant={location.pathname.startsWith("/audit") ? "filled" : "subtle"}
                        onClick={() => navigate("/audit")}
                    >
                        Audits
                    </Button>

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
