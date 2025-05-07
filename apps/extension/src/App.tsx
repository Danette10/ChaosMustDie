import {HashRouter} from "react-router-dom"
import {UserProvider} from "@/context/UserContext"
import AnimatedRoutes from "@/components/AnimatedRoutes.tsx"

const App = () => (
    <div data-theme="cupcake" className="w-[550px] h-[600px] overflow-y-auto overflow-x-hidden">
        <UserProvider>
            <HashRouter>
                <AnimatedRoutes />
            </HashRouter>
        </UserProvider>
    </div>
)

export default App
