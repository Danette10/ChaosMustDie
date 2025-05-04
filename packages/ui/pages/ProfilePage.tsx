import { useUser } from "../context/UserContext"

export const ProfilePage = () => {
  const { user } = useUser()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Profil</h1>
      <p>Bienvenue {user?.username} 👋</p>
    </div>
  )
}

