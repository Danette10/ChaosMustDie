/**
 * Interface représentant un message dans une conversation.
 *
 * @interface Message
 * @property {number} id - Identifiant unique du message.
 * @property {number} conversation_id - Identifiant de la conversation à laquelle le message appartient.
 * @property {number} sender_id - Identifiant de l'expéditeur du message.
 * @property {string} content - Contenu du message.
 * @property {boolean} deleted - Indique si le message a été supprimé.
 * @property {string} timestamp - Horodatage du message.
 * @property {string} [deleted_at] - Horodatage de la suppression du message (optionnel).
 * @property {'me' | 'other'} from - Indique si le message provient de l'utilisateur ou d'un autre expéditeur.
 */
export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    deleted: boolean;
    timestamp: string;
    deleted_at?: string;
    from: 'me' | 'other';
}

/**
 * Type représentant les actions possibles pour le reducer des messages.
 *
 * @typedef {Object} MessageAction
 * @property {'SET_MESSAGES'} type - Action pour définir les messages.
 * @property {Message[] | ((prev: Message[]) => Message[])} payload - Les messages à définir ou une fonction pour les modifier.
 * @property {'ADD_MESSAGE'} type - Action pour ajouter un nouveau message.
 * @property {Message} payload - Le message à ajouter.
 */
export type MessageAction =
    | { type: 'SET_MESSAGES'; payload: Message[] | ((prev: Message[]) => Message[]) }
    | { type: 'ADD_MESSAGE'; payload: Message };

/**
 * Reducer pour gérer les actions sur les messages.
 *
 * @function messageReducer
 * @param {Message[]} state - État actuel des messages.
 * @param {MessageAction} action - Action à appliquer sur l'état des messages.
 * @returns {Message[]} Le nouvel état des messages après application de l'action.
 */
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