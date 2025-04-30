import {createContext, useContext, useEffect, useRef, useState} from "react"
import axiosInstance from "../utils/axiosInstance"

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
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refreshUser: async () => {
    }
})

export const useUser = () => useContext(UserContext)

export function UserProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const hasFetched = useRef(false) // ✅ évite les appels multiples

    const fetchUser = async () => {
        if (hasFetched.current) return
        hasFetched.current = true

        try {
            const res = await axiosInstance.get("/auth/me")
            setUser(res.data)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <UserContext.Provider value={{user, loading, refreshUser: fetchUser}}>
            {children}
        </UserContext.Provider>
    )
}
