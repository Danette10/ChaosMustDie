import { useUser } from "../context/UserContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate("/")
    }
  }, [loading, user, navigate])

  if (loading) return <div className="text-center p-10">Chargement...</div>
  if (!user) return null

  return <>{children}</>
}
