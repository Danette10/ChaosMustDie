import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"

export const useEnforceConfirmationRedirect = (): boolean => {
    const [ready, setReady] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const token = localStorage.getItem("access_token")

        if (!token) {
            setReady(true)
            return
        }

        axiosInstance
            .get("/auth/check-confirm-cookie")
            .then((res) => {
                if (res.data?.status !== "confirmed" && !location.pathname.includes("confirm-code")) {
                    navigate("/confirm-code")
                }
            })
            .catch(() => {
                if (location.pathname.includes("confirm-code")) {
                    navigate("/")
                }
            })
            .finally(() => setReady(true))
    }, [location.pathname, navigate])

    return ready
}
