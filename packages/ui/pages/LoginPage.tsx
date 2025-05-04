import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { BackButton } from "../components/BackButton"
import axiosInstance from "../utils/axiosInstance"

export const LoginPage = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await axiosInstance.post("/auth/login", { email, password })
      const { user, token } = res.data

      if (!token || !user) throw new Error("Réponse invalide")

      localStorage.setItem("access_token", token)
      setUser(user)
      navigate("/")
    } catch (err: any) {
      setError(err.response?.data?.message || "Identifiants invalides")
    }
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
        <div className="w-full max-w-sm p-6 bg-base-100 rounded-xl shadow relative">
          <BackButton />

          <h2 className="text-xl font-bold mb-6 text-center">Connexion</h2>

          {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
                type="email"
                name="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button type="submit" className="btn btn-primary w-full">
              Se connecter
            </button>
          </form>
        </div>
      </div>
  )
}
