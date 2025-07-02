import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './style.css';
import './App.css';

import {BrowserRouter} from "react-router-dom";
import {UserProvider} from "@/context/UserContext.tsx";
import AnimatedRoutes from "@/components/AnimatedRoutes.tsx";
import {Notifications} from '@mantine/notifications';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <Notifications position="top-right"/>
                <AnimatedRoutes/>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
