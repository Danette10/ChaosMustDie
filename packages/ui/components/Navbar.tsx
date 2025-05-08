import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axiosInstance from "../utils/axiosInstance";
import { Box, Button, Group, Paper } from "@mantine/core";

export const Navbar = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            localStorage.removeItem("access_token");
            setUser(null);
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err);
        }
    };

    return (
        <Paper shadow="sm" px="md" py="sm" radius={0} withBorder>
            <Group position="apart" align="center">
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

                    <Button size="xs" color="red" variant="light" onClick={handleLogout}>
                        Déconnexion
                    </Button>
                </Group>
            </Group>
        </Paper>
    );
};
