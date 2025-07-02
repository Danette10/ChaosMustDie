/**
 * Labels for audit statuses.
 *
 * This object maps audit status keys to their corresponding labels in French.
 * It is used to display user-friendly status names in the UI.
 *
 * @type {Record<string, string>}
 * @property {string} pending - "En attente" (Pending status).
 * @property {string} in_progress - "En cours" (In progress status).
 * @property {string} completed - "Terminé" (Completed status).
 * @property {string} failed - "Échoué" (Failed status).
 */
export const statusLabels: Record<string, string> = {
    pending: "En attente",
    in_progress: "En cours",
    completed: "Terminé",
    failed: "Échoué",
};

/**
 * Colors for audit statuses.
 *
 * This object maps audit status keys to their corresponding color codes.
 * It is used to style UI elements based on the audit status.
 *
 * @type {Record<string, string>}
 * @property {string} pending - "yellow" (Color for pending status).
 * @property {string} in_progress - "blue" (Color for in progress status).
 * @property {string} completed - "green" (Color for completed status).
 * @property {string} failed - "red" (Color for failed status).
 */
export const statusColors: Record<string, string> = {
    pending: "yellow",
    in_progress: "blue",
    completed: "green",
    failed: "red",
};