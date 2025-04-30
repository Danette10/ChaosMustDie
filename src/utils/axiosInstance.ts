import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    return match ? decodeURIComponent(match[2]) : null
}

const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true
})

axiosInstance.interceptors.request.use((config) => {
    const csrfToken = getCookie("csrf_access_token")
    if (csrfToken) {
        config.headers["X-CSRF-TOKEN"] = csrfToken
    }
    return config
})

export default axiosInstance
