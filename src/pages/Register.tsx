import React, {useState} from "react"
import axios from "axios"
import PageTransition from "../components/PageTransition.tsx";
import Header from "../components/Header.tsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleRegister = async () => {
        try {
            await axios.post(
                `${BACKEND_URL}/auth/register/auditor`,
                form,
                {withCredentials: true}
            )
            setSuccess("Inscription réussie ✅")
            setError("")
        } catch {
            setError("Erreur pendant l'inscription")
            setSuccess("")
        }
    }

    return (
        <PageTransition>
            <div className="p-4 w-80">
                <Header/>
                <h2 className="text-xl font-bold mb-4">Inscription</h2>
                {error && <div className="alert alert-error mb-2">{error}</div>}
                {success && <div className="alert alert-success mb-2">{success}</div>}
                <input
                    type="text"
                    placeholder="Prénom"
                    className="input input-bordered w-full mb-2"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    placeholder="Nom"
                    className="input input-bordered w-full mb-2"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered w-full mb-2"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="input input-bordered w-full mb-4"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                />
                <button className="btn btn-secondary w-full" onClick={handleRegister}>
                    S'inscrire
                </button>
            </div>
        </PageTransition>
    )
}
