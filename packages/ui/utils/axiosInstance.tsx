import axios from "axios";

/**
 * Instance Axios configurée.
 *
 * Cette instance est utilisée pour effectuer des requêtes HTTP vers l'API.
 * Elle inclut une configuration de base avec une URL par défaut et des interceptors
 * pour gérer les tokens d'authentification et les erreurs de réponse.
 *
 * @constant {AxiosInstance} axiosInstance - Instance Axios configurée.
 */
const axiosInstance = axios.create({
    /**
     * URL de base pour les requêtes API.
     * @type {string}
     */
    baseURL: "https://localhost/api/v1",
});

/**
 * Interceptor de requête.
 *
 * Ajoute le token d'authentification dans les en-têtes de la requête si disponible.
 *
 * @param {AxiosRequestConfig} config - Configuration de la requête.
 * @returns {AxiosRequestConfig} La configuration modifiée de la requête.
 */
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Interceptor de réponse.
 *
 * Gère les réponses et rejette les erreurs.
 *
 * @param {AxiosResponse} response - Réponse de la requête.
 * @param {AxiosError} error - Erreur de la requête.
 * @returns {AxiosResponse|Promise<AxiosError>} La réponse ou une promesse rejetée en cas d'erreur.
 */
axiosInstance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);

/**
 * Exportation de l'instance Axios configurée.
 */
export default axiosInstance;