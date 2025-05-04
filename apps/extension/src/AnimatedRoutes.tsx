import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { WelcomePage } from "@/pages/WelcomePage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ConfirmCode } from "@/pages/ConfirmCode"
import { DashboardPage } from "@/pages/DashboardPage"
import { AuthGuard } from "@/components/AuthGuard"
import { useEnforceConfirmationRedirect } from "@/hooks/useEnforceConfirmationRedirect"
import Layout from "@/components/Layout"

const AnimatedRoutes = () => {
    const location = useLocation()
    const ready = useEnforceConfirmationRedirect()

    if (!ready) return null

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/confirm-code" element={<ConfirmCode />} />
                <Route
                    element={
                        <AuthGuard>
                            <Layout />
                        </AuthGuard>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Route>
            </Routes>
        </AnimatePresence>
    )
}

export default AnimatedRoutes
