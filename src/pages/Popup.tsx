import {useNavigate} from "react-router-dom"
import {useUser} from "../context/UserContext"
import {useEffect} from "react"

export default function Popup() {
    const navigate = useNavigate()
    const {user} = useUser()

    useEffect(() => {
        if (user) {
            navigate("/dashboard")
        }
    }, [user, navigate])

    return (
        <div className="p-4 w-full">
            <h2 className="text-xl font-bold">🚀 Bienvenue !</h2>
            <p className="text-sm text-gray-500">Connecte-toi ou inscris-toi pour continuer.</p>

            <div className="flex flex-col space-y-4 mt-4">
                <button className="btn btn-primary w-full" onClick={() => navigate("/login")}>
                    Connexion
                </button>
                <button className="btn btn-secondary w-full" onClick={() => navigate("/register")}>
                    Inscription
                </button>
            </div>
        </div>
    )
}
