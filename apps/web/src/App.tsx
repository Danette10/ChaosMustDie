import {UserProvider} from "@/context/UserContext"
import {BrowserRouter} from "react-router-dom"
import AnimatedRoutes from "@/components/AnimatedRoutes"

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <AnimatedRoutes/>
            </BrowserRouter>
        </UserProvider>
    )
}

export default App
