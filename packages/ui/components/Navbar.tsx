import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import axiosInstance from "../utils/axiosInstance";

export const Navbar = () => {
    const { user, setUser } = useUser()
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

    return (
        <div className="navbar bg-base-100 shadow px-4">
            <div className="flex-1">
                <span className="text-lg font-semibold">Bonjour, {user?.first_name}</span>
            </div>
            <div className="flex-none space-x-2">
                <button className="btn btn-sm btn-ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
                <button className="btn btn-sm btn-ghost" onClick={() => navigate("/profile")}>Profil</button>
                <button className="btn btn-sm btn-error" onClick={handleLogout}>
                    Déconnexion
                </button>
            </div>
        </div>
    )
}
