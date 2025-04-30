import {useUser} from "../context/UserContext"
import {Navigate, useLocation} from "react-router-dom"
import {JSX} from "react"

export default function AuthGuard({children}: { children: JSX.Element }) {
    const {user, loading} = useUser()
    const location = useLocation()

    if (loading) {
        return <div className="p-4 w-64 text-center">🔄 Vérification...</div>
    }

    if (!user) return <Navigate to="/" replace/>

    const authPages = ["/", "/login", "/register"]
    if (user && authPages.includes(location.pathname)) {
        return <Navigate to="/dashboard" replace/>
    }

    return children
}
