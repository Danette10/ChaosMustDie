import {Route, Routes, useLocation} from "react-router-dom"
import {AnimatePresence} from "framer-motion"

import Popup from "./pages/Popup"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

import AuthGuard from "./components/AuthGuard"

export default function App() {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Popup/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/dashboard" element={<AuthGuard><Dashboard/></AuthGuard>}/>
            </Routes>
        </AnimatePresence>
    )
}
