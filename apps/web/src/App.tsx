import '@mantine/core/styles.css';

import './style.css';
import './App.css';
import {UserProvider} from "@/context/UserContext.tsx";
import {BrowserRouter} from "react-router-dom";
import AnimatedRoutes from "@/components/AnimatedRoutes.tsx";

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
