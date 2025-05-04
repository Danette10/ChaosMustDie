import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const BackButton = () => {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 rounded-full bg-base-200 text-base-content hover:bg-base-300 transition"
            aria-label="Retour"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
    )
}
