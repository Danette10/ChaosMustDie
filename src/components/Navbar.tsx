import {Link, useNavigate} from "react-router-dom"
import {useUser} from "../context/UserContext"
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function Navbar() {
    const {user, loading} = useUser()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await axios.post(`${BACKEND_URL}/auth/logout`, {}, {withCredentials: true})
            localStorage.setItem("logout", Date.now().toString())
            navigate("/login", {replace: true})
            window.location.reload()
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err)
        }
    }

    if (loading || !user) return null

    return (
        <div className="navbar bg-base-100 shadow-md px-4">
            <div className="flex-1">
                <Link to="/dashboard" className="btn btn-ghost text-xl">
                    Chaos Must Die
                </Link>
            </div>
            <div className="flex-none gap-2">
                <Link to="/profile" className="btn btn-ghost">
                    👤 Mon profil
                </Link>
                <button className="btn btn-outline btn-error" onClick={handleLogout}>
                    🔓 Déconnexion
                </button>
            </div>
        </div>
    )
}
