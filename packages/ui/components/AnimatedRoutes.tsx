import {lazy, Suspense} from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import PageTransition from "./PageTransition";
import {AuthGuard} from "./AuthGuard";
import Layout from "./Layout";
import {Loader} from "./Loader";
import {useEnforceConfirmationRedirect} from "../hooks/useEnforceConfirmationRedirect";

const WelcomePage = lazy(() => import("../pages/WelcomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ConfirmCode = lazy(() => import("../pages/auth/ConfirmCode"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const AllAuditorsPage = lazy(() => import("../pages/AllAuditorsPage"));
const AuditPage = lazy(() => import("../pages/audit/AuditPage"));

export default function AnimatedRoutes() {
    const location = useLocation();
    const ready = useEnforceConfirmationRedirect();

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
                        <Route path="/chat/*" element={<PageTransition><ChatPage /></PageTransition>} />
                        <Route path="/auditors" element={<PageTransition><AllAuditorsPage /></PageTransition>} />
                        <Route path="/audit/*" element={<PageTransition><AuditPage/></PageTransition>}/>
                    </Route>
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
}
