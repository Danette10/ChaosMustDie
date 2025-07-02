/**
 * Formate une date et une heure en français.
 *
 * Cette fonction prend une chaîne de caractères représentant une date,
 * la convertit en objet `Date`, puis retourne une chaîne formatée
 * avec la date et l'heure en français.
 *
 * @function formatDateTimeFR
 * @param {string} dateString - La chaîne de caractères représentant la date.
 * @returns {string} La date et l'heure formatées en français (e.g., "dd/mm/yyyy à hh:mm:ss").
 */
export function formatDateTimeFR(dateString: string): string {
    const date = new Date(dateString);
    const d = date.toLocaleDateString("fr-FR");
    const h = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return `${d} à ${h}`;
}