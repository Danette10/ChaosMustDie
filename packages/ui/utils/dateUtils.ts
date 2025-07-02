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
