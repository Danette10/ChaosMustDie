import { useNavigate } from "react-router-dom"
import PageTransition from "../components/PageTransition"
import {useEffect} from "react";
import {useUser} from "../context/UserContext";

export const WelcomePage = () => {
    const { user, loading } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard")
        }
    }, [user, loading, navigate])
    return (
        <PageTransition>
            <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center bg-base-200 p-4 h-full">
                <h1 className="text-2xl font-bold">Bienvenue 👋</h1>
                <p className="text-gray-500">Veuillez vous connecter ou créer un compte.</p>

                <button className="btn btn-primary w-48" onClick={() => navigate("/login")}>
                    Se connecter
                </button>

                <button className="btn btn-outline w-48" onClick={() => navigate("/register")}>
                    S’inscrire
                </button>
            </div>
        </PageTransition>
    )
}
