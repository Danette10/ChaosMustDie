import { BrowserRouter, Routes, Route } from "react-router-dom"
import { UserProvider } from "@/context/UserContext"
import { WelcomePage } from "@/pages/WelcomePage"
import { LoginPage } from "@/pages/LoginPage"

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App

