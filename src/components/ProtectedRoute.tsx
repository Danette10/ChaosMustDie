import {JSX, useEffect, useState} from "react"
import {Navigate} from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"

export default function ProtectedRoute({children}: { children: JSX.Element }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

    useEffect(() => {
        axiosInstance
            .get("/auth/me")
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false))
    }, [])

    if (isLoggedIn === null) return null
    if (isLoggedIn) return <Navigate to="/dashboard" replace/>

    return children
}
