import {useState} from "react"
import Header from "../components/Header.tsx";
import PageTransition from "../components/PageTransition.tsx";
import {useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext"
import axiosInstance from "../utils/axiosInstance.ts";

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const {forceRefreshUser} = useUser()

    const handleLogin = async () => {
        try {
            const res = await axiosInstance.post("/auth/login", {
                email,
                password
            })

            if (window.location.protocol === "chrome-extension:" && res.data?.token) {
                localStorage.setItem("access_token", res.data.token)
            }

            await new Promise(resolve => setTimeout(resolve, 100))

            await forceRefreshUser()
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
