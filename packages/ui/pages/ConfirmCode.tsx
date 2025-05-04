import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { BackButton } from "../components/BackButton"
import { motion } from "framer-motion"

export const ConfirmCode = () => {
    const [code, setCode] = useState("")
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleConfirm = async () => {
        try {
            await axiosInstance.post("/auth/confirm-code", { code })
            setSuccess("Compte confirmé avec succès ✅")
            setError("")
            setTimeout(() => navigate("/login"), 1500)
        } catch {
            setError("Code invalide ou expiré ❌")
            setSuccess("")
        }
    }

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen bg-base-200 p-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-full max-w-sm p-6 bg-base-100 rounded-xl shadow relative">
                <BackButton />
                <h2 className="text-xl font-bold mb-6 text-center">Confirmation du compte</h2>
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
        </motion.div>
    )
}
