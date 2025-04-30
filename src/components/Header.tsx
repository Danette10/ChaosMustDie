import {useLocation, useNavigate} from "react-router-dom"
import {ArrowLeft} from "lucide-react"

export default function Header() {
    const location = useLocation()
    const navigate = useNavigate()

    const showBack = location.pathname !== "/"

    return (
        <div className="flex items-center p-2 border-b bg-base-100 shadow-sm">
            {showBack && (
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-ghost btn-sm"
                    title="Retour"
                >
                    <ArrowLeft className="w-5 h-5"/>
                </button>
            )}
            <h1
                className="text-lg font-semibold ml-2 cursor-pointer"
                onClick={() => navigate("/")}
            >
                Chaos Must Die
            </h1>
        </div>
    )
}
