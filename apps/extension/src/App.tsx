import {HashRouter} from "react-router-dom"
import {UserProvider} from "@/context/UserContext"
import AnimatedRoutes from "@/components/AnimatedRoutes"

const App = () => (
    <div className="w-[550px] h-[600px] overflow-y-auto overflow-x-hidden">
        <UserProvider>
            <HashRouter>
                <AnimatedRoutes />
            </HashRouter>
        </UserProvider>
    </div>
)

export default App
