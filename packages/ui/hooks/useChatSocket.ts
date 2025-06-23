import {useEffect, useRef} from "react";
import {io, Socket} from "socket.io-client";
import {useUser} from "../context/UserContext";

export function useChatSocket() {
    const {token} = useUser();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!token) return;

        const socket = io("wss://ton-domaine.com:5000", {
            query: {token: token},
            transports: ['websocket'],
            secure: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket connected");
        });

        socket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return socketRef;
}
