import {useEffect, useState} from "react"
import {useLocation, useNavigate} from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"

export const useEnforceConfirmationRedirect = (): boolean => {
    const [ready, setReady] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        const pendingEmail = localStorage.getItem("pending_confirmation_email")

        if (!token) {
            if (pendingEmail && !location.pathname.includes("confirm-code")) {
                navigate("/confirm-code")
            }
            setReady(true)
            return
        }

        axiosInstance
            .get("/auth/check-confirm-cookie")
            .then((res) => {
                if (res.data?.status !== "confirmed") {
                    if (!location.pathname.includes("confirm-code")) {
                        navigate("/confirm-code")
                    }
                } else {
                    localStorage.removeItem("pending_confirmation_email")
                    if (location.pathname.includes("confirm-code")) {
                        navigate("/")
                    }
                }
            })
            .catch(() => {
                localStorage.removeItem("pending_confirmation_email")
            })
            .finally(() => setReady(true))
    }, [location.pathname, navigate])

    return ready
}
