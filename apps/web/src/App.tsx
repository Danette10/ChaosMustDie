import '@mantine/core/styles.css';
import './style.css';
import './App.css';

import {BrowserRouter} from "react-router-dom";
import {UserProvider} from "@/context/UserContext.tsx";
import AnimatedRoutes from "@/components/AnimatedRoutes.tsx";

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <AnimatedRoutes/>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
