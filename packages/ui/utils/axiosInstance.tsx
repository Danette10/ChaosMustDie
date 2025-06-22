import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://127.0.0.1:5000/api/v1",
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);

export default axiosInstance;
