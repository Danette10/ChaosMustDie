import {Route, Routes, useLocation, useNavigate} from "react-router-dom"
import {AnimatePresence} from "framer-motion"
import {useEffect, useState} from "react"
import axiosInstance from "./utils/axiosInstance"
import {useUser} from "./context/UserContext"

import Popup from "./pages/Popup"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ConfirmCode from "./pages/ConfirmCode"
import ProfilePage from "./pages/ProfilePage"
import AppLayout from "./layouts/AppLayout"
import AuthGuard from "./components/AuthGuard"

export default function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const [checkedCookie, setCheckedCookie] = useState(false)
    const {user, loading} = useUser()

    useEffect(() => {
        if (loading) return

        if (!user) {
            axiosInstance.get("/auth/check-confirm-cookie")
                .then(() => {
                    if (location.pathname !== "/confirm") {
                        navigate("/confirm")
                    }
                })
                .catch(() => {
                    if (location.pathname === "/confirm") {
                        navigate("/")
                    }
                })
                .finally(() => setCheckedCookie(true))
        } else {
            setCheckedCookie(true)
        }
    }, [user, loading, location.pathname, navigate])

    if (!checkedCookie) return null

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Popup/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/confirm" element={<ConfirmCode/>}/>

                <Route element={<AuthGuard><AppLayout/></AuthGuard>}>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/profile" element={<ProfilePage/>}/>
                </Route>
            </Routes>
        </AnimatePresence>
    )
}
