import {createContext, useContext, useEffect, useState} from "react"
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

type User = {
    id: number
    first_name: string
    last_name: string
    email: string
    user_type: string
    phone_number?: string
}

type UserContextType = {
    user: User | null
    loading: boolean
    refreshUser: () => Promise<void>
    setUser: (u: User | null) => void
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refreshUser: async () => {
    },
    setUser: () => {
    }
})

export const useUser = () => useContext(UserContext)

export function UserProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/auth/me`, {withCredentials: true})
            setUser(res.data)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()

        const onFocus = () => {
            fetchUser()
        }

        window.addEventListener("focus", onFocus)
        return () => window.removeEventListener("focus", onFocus)
    }, [])

    return (
        <UserContext.Provider value={{user, loading, refreshUser: fetchUser, setUser}}>
            {children}
        </UserContext.Provider>
    )
}
