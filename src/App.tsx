import {Route, Routes, useLocation, useNavigate} from "react-router-dom"
import {AnimatePresence} from "framer-motion"
import {useEffect, useState} from "react"
import axios from "axios"

import Popup from "./pages/Popup"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ConfirmCode from "./pages/ConfirmCode"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const [checkedAuth, setCheckedAuth] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get(`${BACKEND_URL}/auth/me`, {withCredentials: true})
                setCheckedAuth(true)
            } catch {
                try {
                    await axios.get(`${BACKEND_URL}/auth/check-confirm-cookie`, {withCredentials: true})
                    if (location.pathname !== "/confirm") {
                        navigate("/confirm")
                    }
                } catch {
                    if (location.pathname === "/confirm") {
                        navigate("/")
                    }
                } finally {
                    setCheckedAuth(true)
                }
            }
        }

        checkAuth()
    }, [location.pathname, navigate])

    if (!checkedAuth) return null

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Popup/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/confirm" element={<ConfirmCode/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
            </Routes>
        </AnimatePresence>
    )
}
