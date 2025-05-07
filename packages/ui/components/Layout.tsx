import {Outlet} from "react-router-dom"
import PageTransition from "./PageTransition"
import {Navbar} from "./Navbar"

export default function Layout() {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            <main className="p-4">
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
        </div>
    )
}
