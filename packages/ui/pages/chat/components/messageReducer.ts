// Définition locale de l'interface Message
export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    deleted: boolean;
    timestamp: string;
    deleted_at?: string;
    from?: 'me' | 'other'; // champ optionnel utilisé dans le frontend
}

// Types d'action pour le reducer
export type MessageAction =
    | { type: 'SET_MESSAGES'; payload: Message[] | ((prev: Message[]) => Message[]) }
    | { type: 'ADD_MESSAGE'; payload: Message };

// Reducer
export const messageReducer = (state: Message[], action: MessageAction): Message[] => {
    switch (action.type) {
        case 'SET_MESSAGES':
            return typeof action.payload === 'function' ? action.payload(state) : action.payload;
        case 'ADD_MESSAGE':
            return [...state, action.payload];
        default:
            return state;
    }
};
