import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function getAccessToken(): string | null {
    return localStorage.getItem("access_token")
}

const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: false
})

axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})

export default axiosInstance
