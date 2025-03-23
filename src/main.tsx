import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import {HashRouter} from "react-router-dom"
import {UserProvider} from "./context/UserContext"
import "./styles/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <HashRouter>
            <UserProvider>
                <App/>
            </UserProvider>
        </HashRouter>
    </React.StrictMode>
)
