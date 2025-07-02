import {useEffect, useRef} from "react";
import {io, Socket} from "socket.io-client";
import {useUser} from "../context/UserContext";

/**
 * Hook personnalisé pour gérer une connexion WebSocket.
 *
 * Ce hook établit une connexion WebSocket à un serveur donné en utilisant le jeton d'authentification
 * de l'utilisateur. Il gère automatiquement la connexion et la déconnexion en fonction de la présence
 * du jeton.
 *
 * @returns {React.RefObject<Socket | null>} Référence au socket WebSocket.
 */
export function useSocket() {
    const {token} = useUser(); // Récupère le jeton d'authentification depuis le contexte utilisateur.
    const socketRef = useRef<Socket | null>(null); // Référence au socket WebSocket.

    useEffect(() => {
        // Ne pas établir de connexion si aucun jeton n'est présent.
        if (!token) return;

        /**
         * Initialise la connexion WebSocket avec le serveur.
         *
         * @type {Socket} Instance du socket WebSocket.
         */
        const socket = io("wss://localhost", {
            auth: {token: token} // Envoie le jeton d'authentification au serveur.
        });

        socketRef.current = socket; // Stocke l'instance du socket dans la référence.

        // Écoute l'événement de connexion.
        socket.on("connect", () => {
            console.log("WebSocket connected");
        });

        // Écoute l'événement de déconnexion.
        socket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        // Déconnecte le socket lors du nettoyage.
        return () => {
            socket.disconnect();
        };
    }, [token]); // Dépendance au jeton d'authentification.

    return socketRef; // Retourne la référence au socket WebSocket.
}