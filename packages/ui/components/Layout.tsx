import { Outlet, useLocation } from "react-router-dom";
import { Container } from "@mantine/core";
import PageTransition from "./PageTransition";
import { Navbar } from "./Navbar";

export default function Layout() {
    const location = useLocation();

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            <Navbar />
            <Container py="md">
                <PageTransition key={location.pathname}>
                    <Outlet />
                </PageTransition>
            </Container>
        </div>
    );
}
