import {HashRouter} from "react-router-dom";
import {UserProvider} from "@/context/UserContext";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import {Box} from "@mantine/core";
import {Notifications} from "@mantine/notifications";

const App = () => (
    <Box w={550} style={{overflowY: "auto", overflowX: "hidden"}}>
        <HashRouter>
            <UserProvider>
                <Notifications position="top-right"/>
                <AnimatedRoutes/>
            </UserProvider>
        </HashRouter>
    </Box>
);

export default App;
