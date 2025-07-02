import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

/**
 * Hook personnalisé pour appliquer une redirection basée sur la confirmation de l'utilisateur.
 *
 * Ce hook vérifie si l'utilisateur a confirmé son compte ou son email. Si ce n'est pas le cas,
 * il redirige vers la page de confirmation de code. Une fois la vérification terminée, il retourne
 * un état indiquant si le processus est prêt.
 *
 * @returns {boolean} Indique si le processus de vérification est terminé.
 */
export const useEnforceConfirmationRedirect = (): boolean => {
    const [ready, setReady] = useState(false); // État indiquant si le processus est prêt.
    const navigate = useNavigate(); // Hook pour effectuer des redirections.
    const location = useLocation(); // Hook pour obtenir les informations sur l'emplacement actuel.

    useEffect(() => {
        /**
         * Fonction asynchrone pour vérifier la confirmation de l'utilisateur.
         *
         * Cette fonction vérifie la présence d'un jeton d'accès et d'un email en attente de confirmation.
         * Elle effectue une requête au serveur pour vérifier l'état de confirmation et applique les redirections nécessaires.
         */
        const checkConfirmation = async () => {
            const token = localStorage.getItem("access_token"); // Récupère le jeton d'accès depuis le stockage local.
            const pendingEmail = localStorage.getItem("pending_confirmation_email"); // Récupère l'email en attente de confirmation.

            // Si aucun jeton n'est présent, redirige vers la page de confirmation si nécessaire.
            if (!token) {
                if (pendingEmail && !location.pathname.includes("confirm-code")) {
                    navigate("/confirm-code");
                }
                setReady(true);
                return;
            }

            try {
                // Vérifie l'état de confirmation via une requête au serveur.
                const res = await axiosInstance.get("/auth/check-confirm-cookie");

                if (res.data?.status !== "confirmed") {
                    // Redirige vers la page de confirmation si l'utilisateur n'est pas confirmé.
                    if (!location.pathname.includes("confirm-code")) {
                        navigate("/confirm-code");
                    }
                } else {
                    // Supprime l'email en attente de confirmation si l'utilisateur est confirmé.
                    localStorage.removeItem("pending_confirmation_email");
                    if (location.pathname.includes("confirm-code")) {
                        navigate("/");
                    }
                }
            } catch {
                // Supprime l'email en attente de confirmation en cas d'erreur.
                localStorage.removeItem("pending_confirmation_email");
            } finally {
                // Indique que le processus est terminé.
                setReady(true);
            }
        };

        checkConfirmation();
    }, [location.pathname, navigate]); // Dépendances du hook useEffect.

    return ready; // Retourne l'état indiquant si le processus est prêt.
};