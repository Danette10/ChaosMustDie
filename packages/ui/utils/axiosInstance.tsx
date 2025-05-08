import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://192.168.1.180:5000/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // ✅ important
    }
    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);

export default axiosInstance;
