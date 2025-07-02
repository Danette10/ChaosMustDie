/**
 * AnimatedRoutes Component
 *
 * This component handles route transitions with animations using `framer-motion`'s `AnimatePresence`.
 * It also utilizes lazy loading for pages and guards certain routes with authentication checks.
 *
 * Dependencies:
 * - React
 * - React Router DOM
 * - Framer Motion
 * - Custom hooks and components
 */

import {lazy, Suspense} from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import PageTransition from "./PageTransition";
import {AuthGuard} from "./AuthGuard";
import Layout from "./Layout";
import {Loader} from "./Loader";
import {useEnforceConfirmationRedirect} from "../hooks/useEnforceConfirmationRedirect";

// Lazy-loaded pages for optimized performance
const WelcomePage = lazy(() => import("../pages/WelcomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ConfirmCode = lazy(() => import("../pages/auth/ConfirmCode"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const AllAuditorsPage = lazy(() => import("../pages/AllAuditorsPage"));
const AuditPage = lazy(() => import("../pages/audit/AuditPage"));

/**
 * AnimatedRoutes Component
 *
 * @returns {JSX.Element} The animated routes with lazy-loaded pages and authentication guards.
 */
export default function AnimatedRoutes() {
    const location = useLocation(); // Retrieves the current location object from React Router
    const ready = useEnforceConfirmationRedirect(); // Custom hook to enforce confirmation redirect logic

    // Display a loader until the confirmation redirect logic is ready
    if (!ready) return <Loader/>;

    return (
        <AnimatePresence mode="wait"> {/* Handles animations for route transitions */}
            <Suspense fallback={<Loader/>}> {/* Displays a loader while lazy-loaded components are being fetched */}
                <Routes location={location} key={location.pathname}> {/* Defines the routes for the application */}
                    {/* Public routes */}
                    <Route path="/" element={<PageTransition><WelcomePage/></PageTransition>}/>
                    <Route path="/login" element={<PageTransition><LoginPage/></PageTransition>}/>
                    <Route path="/register" element={<PageTransition><RegisterPage/></PageTransition>}/>
                    <Route path="/confirm-code" element={<PageTransition><ConfirmCode/></PageTransition>}/>
                    <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage/></PageTransition>}/>
                    <Route path="/reset-password" element={<PageTransition><ResetPasswordPage/></PageTransition>}/>

                    {/* Protected routes wrapped with AuthGuard */}
                    <Route
                        element={
                            <AuthGuard> {/* Ensures the user is authenticated */}
                                <Layout/> {/* Provides a common layout for protected routes */}
                            </AuthGuard>
                        }
                    >
                        <Route path="/dashboard" element={<PageTransition><DashboardPage/></PageTransition>}/>
                        <Route path="/profile" element={<PageTransition><ProfilePage/></PageTransition>}/>
                        <Route path="/chat/*" element={<PageTransition><ChatPage/></PageTransition>}/>
                        <Route path="/auditors" element={<PageTransition><AllAuditorsPage/></PageTransition>}/>
                        <Route path="/audit/*" element={<PageTransition><AuditPage/></PageTransition>}/>
                    </Route>
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
}