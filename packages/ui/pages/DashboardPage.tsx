import {useUser} from "../context/UserContext"

export const DashboardPage = () => {
    const { user } = useUser()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
            <h1 className="text-2xl font-bold mb-4">Bienvenue, {user?.first_name} 👋</h1>
            <p className="text-gray-500">Ceci est votre tableau de bord sécurisé.</p>
        </div>
    )
}
