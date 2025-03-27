import React, {useState} from "react"
import axios from "axios"
import {AnimatePresence, motion} from "framer-motion"
import PageTransition from "../components/PageTransition"
import Header from "../components/Header"
import {useNavigate} from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function Register() {
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
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleRegister = async () => {
        const endpoint = `${BACKEND_URL}/auth/register/${userType}`
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
            await axios.post(endpoint, payload, {withCredentials: true})
            setSuccess("Inscription réussie ✅")
            setError("")
            setTimeout(() => navigate("/confirm-code"), 500)
        } catch {
            setError("Erreur pendant l'inscription")
            setSuccess("")
        }

    }

    return (
        <PageTransition>
            <div className="p-4 w-80">
                <Header/>
                <div className="tabs mb-4 flex justify-center">
                    <button
                        className={`tab tab-bordered ${
                            userType === "auditor" ? "tab-active" : ""
                        }`}
                        onClick={() => setUserType("auditor")}
                    >
                        Auditeur
                    </button>
                    <button
                        className={`tab tab-bordered ${
                            userType === "company" ? "tab-active" : ""
                        }`}
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
                        initial={{opacity: 0, x: 50}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: -50}}
                        transition={{duration: 0.3}}
                    >
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
                            type="tel"
                            placeholder="Numéro de téléphone"
                            className="input input-bordered w-full mb-2"
                            name="phone_number"
                            value={form.phone_number}
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

                        {userType === "company" && (
                            <>
                                <input
                                    type="text"
                                    placeholder="SIREN"
                                    className="input input-bordered w-full mb-2"
                                    name="siren"
                                    value={form.siren}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    placeholder="Nom de l'entreprise"
                                    className="input input-bordered w-full mb-2"
                                    name="name_company"
                                    value={form.name_company}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    placeholder="Adresse"
                                    className="input input-bordered w-full mb-2"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                />
                                <input
                                    type="email"
                                    placeholder="Email de contact"
                                    className="input input-bordered w-full mb-2"
                                    name="contact_email"
                                    value={form.contact_email}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    placeholder="Lien du site web"
                                    className="input input-bordered w-full mb-4"
                                    name="link"
                                    value={form.link}
                                    onChange={handleChange}
                                />
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                <button className="btn btn-secondary w-full" onClick={handleRegister}>
                    S'inscrire
                </button>
            </div>
        </PageTransition>
    )
}
