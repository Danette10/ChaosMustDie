import {JSX, useEffect, useState} from "react"
import {Navigate} from "react-router-dom"
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProtectedRoute({children}: { children: JSX.Element }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/auth/me`, {withCredentials: true})
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false))
    }, [])

    if (isLoggedIn === null) return null

    if (isLoggedIn) return <Navigate to="/dashboard" replace/>

    return children
}
