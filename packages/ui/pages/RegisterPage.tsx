import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { BackButton } from "../components/BackButton"
import axiosInstance from "../utils/axiosInstance"

export const RegisterPage = () => {
    const navigate = useNavigate()
    const [userType, setUserType] = useState<"auditor" | "company">("auditor")
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        siren: "",
        name_company: "",
        address: "",
        contact_email: "",
        link: ""
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleRegister = async () => {
        const endpoint = `/auth/register/${userType}`
        const payload =
            userType === "auditor"
                ? {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    phone_number: form.phone_number,
                    password: form.password
                }
                : {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    phone_number: form.phone_number,
                    password: form.password,
                    siren: form.siren,
                    name_company: form.name_company,
                    address: form.address,
                    contact_email: form.contact_email,
                    link: form.link
                }

        try {
            await axiosInstance.post(endpoint, payload)
            setSuccess("Inscription réussie ✅")
            setError("")
            setTimeout(() => navigate("/confirm-code"), 500)
        } catch {
            setError("Erreur pendant l'inscription")
            setSuccess("")
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-base-200 p-4 overflow-y-auto">
            <div className="w-full max-w-sm p-6 bg-base-100 rounded-xl shadow relative">
                <BackButton />
                <h2 className="text-xl font-bold mb-6 text-center">Inscription</h2>

                <div className="tabs flex justify-center mb-4">
                    <button
                        className={`tab tab-bordered ${userType === "auditor" ? "tab-active" : ""}`}
                        onClick={() => setUserType("auditor")}
                    >
                        Auditeur
                    </button>
                    <button
                        className={`tab tab-bordered ${userType === "company" ? "tab-active" : ""}`}
                        onClick={() => setUserType("company")}
                    >
                        Entreprise
                    </button>
                </div>

                {error && <div className="alert alert-error mb-2">{error}</div>}
                {success && <div className="alert alert-success mb-2">{success}</div>}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={userType}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <input type="text" name="first_name" placeholder="Prénom" className="input input-bordered w-full mb-2" value={form.first_name} onChange={handleChange} />
                        <input type="text" name="last_name" placeholder="Nom" className="input input-bordered w-full mb-2" value={form.last_name} onChange={handleChange} />
                        <input type="email" name="email" placeholder="Email" className="input input-bordered w-full mb-2" value={form.email} onChange={handleChange} />
                        <input type="tel" name="phone_number" placeholder="Téléphone" className="input input-bordered w-full mb-2" value={form.phone_number} onChange={handleChange} />
                        <input type="password" name="password" placeholder="Mot de passe" className="input input-bordered w-full mb-4" value={form.password} onChange={handleChange} />

                        {userType === "company" && (
                            <>
                                <input type="text" name="siren" placeholder="SIREN" className="input input-bordered w-full mb-2" value={form.siren} onChange={handleChange} />
                                <input type="text" name="name_company" placeholder="Nom de l'entreprise" className="input input-bordered w-full mb-2" value={form.name_company} onChange={handleChange} />
                                <input type="text" name="address" placeholder="Adresse" className="input input-bordered w-full mb-2" value={form.address} onChange={handleChange} />
                                <input type="email" name="contact_email" placeholder="Email de contact" className="input input-bordered w-full mb-2" value={form.contact_email} onChange={handleChange} />
                                <input type="text" name="link" placeholder="Lien du site" className="input input-bordered w-full mb-4" value={form.link} onChange={handleChange} />
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                <button onClick={handleRegister} className="btn btn-secondary w-full">
                    S’inscrire
                </button>
            </div>
        </div>
    )
}
