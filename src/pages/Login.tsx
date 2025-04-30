import {useState} from "react"
import axios from "axios"
import Header from "../components/Header.tsx";
import PageTransition from "../components/PageTransition.tsx";
import {useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const {refreshUser} = useUser()

    const handleLogin = async () => {
        try {
            await axios.post(`${BACKEND_URL}/auth/login`, {
                email,
                password
            }, {
                withCredentials: true
            })

            await refreshUser()

            navigate("/dashboard")
        } catch (err) {
            setError("Email ou mot de passe incorrect")
        }
    }

    return (
        <PageTransition>
            <div className="p-4 w-full">
                <Header/>
                <h2 className="text-xl font-bold mb-4">Connexion</h2>
                {error && <div className="alert alert-error mb-2">{error}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered w-full mb-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="input input-bordered w-full mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn btn-primary w-full" onClick={handleLogin}>
                    Se connecter
                </button>
            </div>
        </PageTransition>
    )
}
