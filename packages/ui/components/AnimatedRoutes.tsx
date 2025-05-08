import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import { AuthGuard } from "./AuthGuard";
import Layout from "./Layout";
import { Loader } from "./Loader";
import { useEnforceConfirmationRedirect } from "../hooks/useEnforceConfirmationRedirect"; // ✅ IMPORT

const WelcomePage = lazy(() => import("../pages/WelcomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ConfirmCode = lazy(() => import("../pages/ConfirmCode"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));

export default function AnimatedRoutes() {
    const location = useLocation();
    const ready = useEnforceConfirmationRedirect(); // ✅ UTILISATION DU HOOK

    if (!ready) return <Loader />;

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<Loader />}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageTransition><WelcomePage /></PageTransition>} />
                    <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                    <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                    <Route path="/confirm-code" element={<PageTransition><ConfirmCode /></PageTransition>} />
                    <Route
                        element={
                            <AuthGuard>
                                <Layout />
                            </AuthGuard>
                        }
                    >
                        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
                        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                    </Route>
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
}
