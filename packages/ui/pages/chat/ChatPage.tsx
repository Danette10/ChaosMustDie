import {Route, Routes} from "react-router-dom";
import ChatListPage from "./ChatListPage";
import ChatConversationPage from "./ChatConversationPage";

export default function ChatPage() {
    return (
        <Routes>
            <Route path="/" element={<ChatListPage/>}/>
            <Route path=":conversationId" element={<ChatConversationPage/>}/>
        </Routes>
    );
}
