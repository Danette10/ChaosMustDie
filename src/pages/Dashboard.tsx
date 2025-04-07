import {useUser} from "../context/UserContext"
import {useNavigate} from "react-router-dom"
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function Dashboard() {
    const navigate = useNavigate()
    const {user, loading, setUser} = useUser() // ✅ ajoute setUser

    const handleLogout = async () => {
        try {
            await axios.post(`${BACKEND_URL}/auth/logout`, {}, {withCredentials: true})
            setUser(null)
            navigate("/login", {replace: true})
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err)
        }
    }

    if (loading) return <div className="p-4 w-64 text-center">🔄 Chargement...</div>
    if (!user) return null

    return (
        <div className="p-4 w-64">
            <h2 className="text-xl font-bold">🎉 Bonjour {user.first_name} !</h2>
            <p className="text-sm text-gray-500">Tu es connecté en tant que {user.user_type}.</p>

            <button className="btn btn-error mt-4 w-full" onClick={handleLogout}>
                Déconnexion
            </button>
        </div>
    )
}
