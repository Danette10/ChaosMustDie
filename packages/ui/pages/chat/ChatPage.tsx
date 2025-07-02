import {Route, Routes} from "react-router-dom";
import ChatListPage from "./ChatListPage";
import ChatConversationPage from "./ChatConversationPage";

/**
 * Composant ChatPage.
 *
 * Ce composant gère les routes pour la fonctionnalité de chat. Il affiche soit la liste des conversations,
 * soit une conversation spécifique en fonction de l'URL.
 *
 * @returns {JSX.Element} Le composant ChatPage contenant les routes de la fonctionnalité de chat.
 */
export default function ChatPage() {
    return (
        <Routes>
            {/* Route pour afficher la liste des conversations */}
            <Route path="/" element={<ChatListPage/>}/>
            {/* Route pour afficher une conversation spécifique basée sur l'identifiant de la conversation */}
            <Route path=":conversationId" element={<ChatConversationPage/>}/>
        </Routes>
    );
}