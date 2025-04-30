import {useUser} from "../context/UserContext"
import Navbar from "../components/Navbar"
import {Outlet} from "react-router-dom"

export default function AppLayout() {
    const {user, loading} = useUser()

    if (loading) return <p className="p-4">Chargement...</p>

    if (!user) return <p className="p-4">Non autorisé.</p> // ou <Navigate to="/login" />

    return (
        <div>
            <Navbar/>
            <main className="p-4">
                <Outlet/>
            </main>
        </div>
    )
}
