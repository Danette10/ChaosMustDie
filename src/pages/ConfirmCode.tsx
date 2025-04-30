import {useState} from "react"
import axiosInstance from "../utils/axiosInstance"
import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import {useNavigate} from "react-router-dom"

export default function ConfirmCode() {
    const [code, setCode] = useState("")
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleConfirm = async () => {
        try {
            await axiosInstance.post("/auth/confirm-code", {code})
            setSuccess("Compte confirmé avec succès ✅")
            setError("")
            setTimeout(() => navigate("/login"), 1500)
        } catch {
            setError("Code invalide ou expiré ❌")
            setSuccess("")
        }
    }

    return (
        <PageTransition>
            <div className="p-4 w-80">
                <Header/>
                <h2 className="text-xl font-bold mb-4">Confirmation du compte</h2>
                {error && <div className="alert alert-error mb-2">{error}</div>}
                {success && <div className="alert alert-success mb-2">{success}</div>}
                <input
                    type="text"
                    placeholder="Code de confirmation"
                    className="input input-bordered w-full mb-4"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <button className="btn btn-primary w-full" onClick={handleConfirm}>
                    Valider le code
                </button>
            </div>
        </PageTransition>
    )
}
