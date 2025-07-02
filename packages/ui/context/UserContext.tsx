import {createContext, useContext, useEffect, useRef, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {UserTypeEnum} from "../enum/UserTypeEnum";
import {useNavigate} from "react-router-dom";

/**
 * Type représentant un utilisateur.
 *
 * @typedef {Object} User
 * @property {number} id - Identifiant unique de l'utilisateur.
 * @property {string} firstname - Prénom de l'utilisateur.
 * @property {string} lastname - Nom de famille de l'utilisateur.
 * @property {string} email - Adresse email de l'utilisateur.
 * @property {UserTypeEnum} user_type - Type d'utilisateur (auditeur ou entreprise).
 * @property {string} [phone_number] - Numéro de téléphone de l'utilisateur (optionnel).
 * @property {Object} [company] - Informations sur l'entreprise associée (optionnel).
 * @property {number} company.id - Identifiant unique de l'entreprise.
 * @property {string} company.name - Nom de l'entreprise.
 * @property {string} company.siren - SIREN de l'entreprise.
 * @property {string} company.address - Adresse de l'entreprise.
 * @property {string} company.contact_email - Email de contact de l'entreprise.
 * @property {string} company.link - Lien vers le site de l'entreprise.
 */
type User = {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user_type: UserTypeEnum;
    phone_number?: string;
    company?: {
        id: number;
        name: string;
        siren: string;
        address: string;
        contact_email: string;
        link: string;
    };
};

/**
 * Type représentant le contexte utilisateur.
 *
 * @typedef {Object} UserContextType
 * @property {User | null} user - Données de l'utilisateur connecté ou null si non connecté.
 * @property {string | null} token - Jeton d'accès de l'utilisateur ou null si non disponible.
 * @property {boolean} loading - Indique si les données utilisateur sont en cours de chargement.
 * @property {() => Promise<void>} refreshUser - Fonction pour rafraîchir les données utilisateur.
 * @property {() => Promise<void>} forceRefreshUser - Fonction pour forcer le rafraîchissement des données utilisateur.
 * @property {(u: User | null) => void} setUser - Fonction pour mettre à jour les données utilisateur.
 */
type UserContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    forceRefreshUser: () => Promise<void>;
    setUser: (u: User | null) => void;
};

/**
 * Contexte utilisateur.
 *
 * @type {React.Context<UserContextType>}
 */
const UserContext = createContext<UserContextType>({
    user: null,
    token: null,
    loading: true,
    forceRefreshUser(): Promise<void> {
        return Promise.resolve(undefined);
    },
    refreshUser: async () => {
    },
    setUser: () => {
    },
});

/**
 * Hook pour accéder au contexte utilisateur.
 *
 * @returns {UserContextType} Le contexte utilisateur.
 */
export const useUser = () => useContext(UserContext);

/**
 * Vérifie si le jeton d'accès est expiré.
 *
 * @returns {boolean} True si le jeton est expiré, sinon false.
 */
const isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem("token_expiry");
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
};

/**
 * Fournisseur de contexte utilisateur.
 *
 * Ce composant enveloppe ses enfants et fournit le contexte utilisateur.
 *
 * @param {Object} props - Props du composant.
 * @param {React.ReactNode} props.children - Enfants du fournisseur de contexte.
 * @returns {JSX.Element} Le fournisseur de contexte utilisateur.
 */
export function UserProvider({children}: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);
    const localToken = localStorage.getItem("access_token");

    /**
     * Récupère les données utilisateur depuis le serveur.
     */
    const fetchUser = async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const token = localStorage.getItem("access_token");
        if (!token || isTokenExpired()) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("token_expiry");
            setUser(null);
            setLoading(false);
            navigate("/");
            return;
        }

        try {
            const res = await axiosInstance.get("/auth/me");
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();

        const onFocus = () => {
            fetchUser();
        };

        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    /**
     * Force le rafraîchissement des données utilisateur.
     */
    const forceRefreshUser = async () => {
        const token = localStorage.getItem("access_token");
        if (!token || isTokenExpired()) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("token_expiry");
            setUser(null);
            setLoading(false);
            navigate("/");
            return;
        }

        try {
            const res = await axiosInstance.get("/auth/me");
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider
            value={{user, token: localToken, loading, refreshUser: fetchUser, forceRefreshUser, setUser}}
        >
            {children}
        </UserContext.Provider>
    );
}

export type {User};