/**
 * Configuration des champs pour différents types d'audits.
 *
 * Cet objet contient les configurations des champs nécessaires pour chaque type d'audit.
 * Chaque type d'audit est représenté par une clé, et les champs associés sont définis
 * sous forme de tableau d'objets contenant les propriétés suivantes :
 * - `label` : Le libellé du champ affiché à l'utilisateur.
 * - `key` : La clé unique identifiant le champ.
 * - `type` : Le type de données attendu pour le champ (e.g., `number`, `text`, `file`).
 * - `default` : La valeur par défaut du champ (optionnelle).
 *
 * @type {Record<string, {label: string, key: string, type: string, default?: any}[]>}
 */
export const auditFieldConfig: Record<string, {
    label: string;
    key: string;
    type: string;
    default?: any,
    defaultName?: any
}[]> = {
    /**
     * Configuration des champs pour les audits de type DDoS.
     */
    ddos: [
        {label: "Durée (secondes)", key: "duration", type: "number", default: 60},
        {label: "Nombre de connexions", key: "connections", type: "number", default: 15000},
        {label: "Taux (connexions/sec)", key: "rate", type: "number", default: 1500},
        {label: "Intervalle d’envoi (s)", key: "interval", type: "number", default: 1},
        {label: "Type de requête", key: "test_type", type: "text", default: "GET"},
    ],

    /**
     * Configuration des champs pour les audits de type SQLi.
     */
    sqli: [
        {label: "Profondeur de scan", key: "depth", type: "number", default: 2},
        {label: "Nombre de threads", key: "workers", type: "number", default: 5}
    ],

    /**
     * Configuration des champs pour les audits de type XSS.
     */
    xss: [
        {label: "Profondeur de scan", key: "depth", type: "number", default: 2},
        {label: "Nombre de threads", key: "workers", type: "number", default: 5}
    ],

    /**
     * Configuration des champs pour les audits de type bruteforce.
     */
    bruteforce: [
        {label: "Chemin du formulaire de login", key: "login_path", type: "text", default: "/login.php"},
        {label: "Nom du champ identifiant", key: "username_field", type: "text", default: "email"},
        {label: "Nom du champ mot de passe", key: "password_field", type: "text", default: "password"},
        {label: "Nom d’utilisateur (optionnel)", key: "username", type: "text", default: "test@gmail.com"},
        {label: "Wordlist de noms d’utilisateur", key: "username_wordlist", type: "file"},
        {label: "Wordlist de mots de passe", key: "password_wordlist", type: "file", defaultName: "rockyou-50.txt"},
        {label: "Nombre de threads", key: "threads", type: "number", default: 10}
    ],

    /**
     * Configuration des champs pour les audits de type endpoint discovery.
     */
    endpoint_discovery: [
        {label: "Wordlist de chemins", key: "wordlist", type: "file", defaultName: "common.txt"},
        {label: "Nombre de threads", key: "workers", type: "number", default: 5000000}
    ],

    /**
     * Configuration des champs pour les audits de type web technologies.
     * Aucun champ spécifique n'est défini pour ce type d'audit.
     */
    web_technologies: [],

    /**
     * Configuration des champs pour les audits de type http header identification.
     * Aucun champ spécifique n'est défini pour ce type d'audit.
     */
    http_header_identification: [],
};