export const auditFieldConfig: Record<string, { label: string; key: string; type: string; default?: any }[]> = {
    ddos: [
        {label: "Durée (secondes)", key: "duration", type: "number", default: 60},
        {label: "Nombre de connexions", key: "connections", type: "number", default: 15000},
        {label: "Taux (connexions/sec)", key: "rate", type: "number", default: 1500},
        {label: "Intervalle d’envoi (s)", key: "interval", type: "number", default: 1},
        {label: "Type de requête", key: "test_type", type: "text", default: "GET"},
    ],
    sqli: [],
    xss: [],
    bruteforce: [
        { label: "Chemin du formulaire de login", key: "login_path", type: "text", default: "/login.php" },
        { label: "Nom du champ identifiant", key: "username_field", type: "text", default: "email" },
        { label: "Nom du champ mot de passe", key: "password_field", type: "text", default: "password" },
        { label: "Nom d’utilisateur (optionnel)", key: "username", type: "text" },
        { label: "Wordlist de noms d’utilisateur", key: "username_wordlist", type: "file" },
        { label: "Wordlist de mots de passe", key: "password_wordlist", type: "file" },
        { label: "Nombre de threads", key: "threads", type: "number", default: 10 },
    ],
    endpoint_discovery: [],
    web_technologies: [],
    http_header_identification: [],
};
