import {Route, Routes, useLocation, useNavigate} from "react-router-dom"
import {AnimatePresence} from "framer-motion"
import {useEffect, useState} from "react"
import axios from "axios"

import Popup from "./pages/Popup"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ConfirmCode from "./pages/ConfirmCode"
import ProfilePage from "./pages/ProfilePage"
import AppLayout from "./layouts/AppLayout" // ✅
import AuthGuard from "./components/AuthGuard"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const [checkedCookie, setCheckedCookie] = useState(false)

    useEffect(() => {
        axios.get(`${BACKEND_URL}/auth/me`, {withCredentials: true})
            .then(() => {
                // ✅ déjà connecté → ne check PAS le cookie
                setCheckedCookie(true)
            })
            .catch(() => {
                // ❌ pas connecté → check s’il y a un cookie de validation
                axios.get(`${BACKEND_URL}/auth/check-confirm-cookie`, {withCredentials: true})
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
            })
    }, [location.pathname, navigate])


    if (!checkedCookie) return null

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Popup/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/confirm" element={<ConfirmCode/>}/>

                {/* ✅ Routes protégées AVEC layout et navbar */}
                <Route element={<AuthGuard><AppLayout/></AuthGuard>}>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/profile" element={<ProfilePage/>}/>
                </Route>
            </Routes>
        </AnimatePresence>
    )
}
