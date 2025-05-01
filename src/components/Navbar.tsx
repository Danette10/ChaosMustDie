import {Link, useNavigate} from "react-router-dom"
import {useUser} from "../context/UserContext"
import axiosInstance from "../utils/axiosInstance"

export default function Navbar() {
    const {user, loading, setUser} = useUser()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout")
            localStorage.removeItem("access_token")

            setUser(null)
            navigate("/login", {replace: true})
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err)
        }
    }


    if (loading || !user) return null

    return (
        <div className="navbar bg-base-100 shadow-md px-4">
            <div className="flex-1">
                <Link to="/dashboard" className="btn btn-ghost text-xl">Chaos Must Die</Link>
            </div>
            <div className="flex-none gap-2">
                <Link to="/profile" className="btn btn-ghost">👤 Mon profil</Link>
                <button className="btn btn-outline btn-error" onClick={handleLogout}>
                    🔓 Déconnexion
                </button>
            </div>
        </div>
    )
}
