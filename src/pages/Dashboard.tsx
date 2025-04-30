import {useUser} from "../context/UserContext"

export default function Dashboard() {
    const {user, loading} = useUser()

    if (loading) return <div className="p-4 w-64 text-center">🔄 Chargement...</div>
    if (!user) return null

    return (
        <div className="p-4 w-64">
            <h2 className="text-xl font-bold">🎉 Bonjour {user.first_name} !</h2>
            <p className="text-sm text-gray-500">Tu es connecté en tant que {user.user_type}.</p>

        </div>
    )
}
