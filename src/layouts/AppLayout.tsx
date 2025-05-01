import { useUser } from "../context/UserContext"
import Navbar from "../components/Navbar"
import PageTransition from "../components/PageTransition"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
    const { user, loading } = useUser()

    if (loading) return <p className="p-4">Chargement...</p>
    if (!user) return <p className="p-4">Non autorisé.</p>

    return (
        <div>
            <Navbar />
            <main className="p-4">
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
        </div>
    )
}
