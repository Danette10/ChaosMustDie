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
    bruteforce: [],
    endpoint_discovery: [],
    web_technologies: [],
    http_header_identification: [],
};
