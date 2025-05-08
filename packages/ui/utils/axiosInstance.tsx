import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://192.168.1.180:5000/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
});

// Intercepteur de requête : ajoute le token d'accès
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = token;
    return config;
});

// Intercepteur de réponse : rafraîchit le token si expiré
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Si erreur 401 et qu'on n'a pas déjà tenté le refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) throw new Error("Aucun refresh token trouvé");

                // Demande un nouveau access token
                const res = await axios.post(
                    "https://192.168.1.180:5000/api/v1/auth/refresh",
                    {},
                    {
                        headers: {
                            Authorization: refreshToken
                        }
                    }
                );

                const newAccessToken = res.data.access_token;
                localStorage.setItem("access_token", newAccessToken);

                // Met à jour le header et rejoue la requête échouée
                originalRequest.headers.Authorization = newAccessToken;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Échec du refresh token :", refreshError);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
