/**
 * Enumération des types d'audit.
 *
 * Cette énumération définit les différents types d'audit disponibles dans l'application.
 *
 * @enum {string}
 * @property {string} SQLI - Représente une injection SQL.
 * @property {string} DDOS - Représente une attaque par déni de service distribué (DDOS).
 * @property {string} BRUTEFORCE - Représente une attaque par bruteforce.
 * @property {string} WEB_TECHNOLOGIES - Représente la découverte des technologies web.
 * @property {string} ENDPOINT_DISCOVERY - Représente la découverte d'endpoint.
 * @property {string} XSS - Représente une attaque de type cross-site scripting (XSS).
 * @property {string} HTTP_HEADER_IDENTIFICATION - Représente l'identification des entêtes HTTP.
 */
export enum AuditTypeEnum {
    SQLI = "Injection SQL",
    DDOS = "DDOS",
    BRUTEFORCE = "BRUTEFORCE",
    WEB_TECHNOLOGIES = "WEB_TECHNOLOGIES",
    ENDPOINT_DISCOVERY = "ENDPOINT_DISCOVERY",
    XSS = "XSS",
    HTTP_HEADER_IDENTIFICATION = "HTTP_HEADER_IDENTIFICATION",
}

/**
 * Labels des types d'audit.
 *
 * Cet objet associe chaque type d'audit à son label en français.
 * Il est utilisé pour afficher des noms compréhensibles dans l'interface utilisateur.
 *
 * @type {Record<AuditTypeEnum, string>}
 * @property {string} SQLI - "Injection SQL" (label pour le type SQLI).
 * @property {string} DDOS - "DDOS" (label pour le type DDOS).
 * @property {string} BRUTEFORCE - "Bruteforce" (label pour le type BRUTEFORCE).
 * @property {string} WEB_TECHNOLOGIES - "Découverte des technologies web" (label pour le type WEB_TECHNOLOGIES).
 * @property {string} ENDPOINT_DISCOVERY - "Découverte d'endpoint" (label pour le type ENDPOINT_DISCOVERY).
 * @property {string} XSS - "Cross-site scripting (XSS)" (label pour le type XSS).
 * @property {string} HTTP_HEADER_IDENTIFICATION - "Identification des entêtes HTTP" (label pour le type HTTP_HEADER_IDENTIFICATION).
 */
export const AuditTypeLabels: Record<AuditTypeEnum, string> = {
    [AuditTypeEnum.SQLI]: "Injection SQL",
    [AuditTypeEnum.DDOS]: "DDOS",
    [AuditTypeEnum.BRUTEFORCE]: "Bruteforce",
    [AuditTypeEnum.WEB_TECHNOLOGIES]: "Découverte des technologies web",
    [AuditTypeEnum.ENDPOINT_DISCOVERY]: "Découverte d'endpoint",
    [AuditTypeEnum.XSS]: "Cross-site scripting (XSS)",
    [AuditTypeEnum.HTTP_HEADER_IDENTIFICATION]: "Identification des entêtes HTTP",
};

/**
 * Couleurs des types d'audit.
 *
 * Cet objet associe chaque type d'audit à une couleur spécifique.
 * Il est utilisé pour styliser les éléments de l'interface utilisateur en fonction du type d'audit.
 *
 * @type {Record<AuditTypeEnum, string>}
 * @property {string} SQLI - "red" (couleur pour le type SQLI).
 * @property {string} DDOS - "orange" (couleur pour le type DDOS).
 * @property {string} BRUTEFORCE - "blue" (couleur pour le type BRUTEFORCE).
 * @property {string} WEB_TECHNOLOGIES - "green" (couleur pour le type WEB_TECHNOLOGIES).
 * @property {string} ENDPOINT_DISCOVERY - "grape" (couleur pour le type ENDPOINT_DISCOVERY).
 * @property {string} XSS - "violet" (couleur pour le type XSS).
 * @property {string} HTTP_HEADER_IDENTIFICATION - "cyan" (couleur pour le type HTTP_HEADER_IDENTIFICATION).
 */
export const AuditTypeColors: Record<AuditTypeEnum, string> = {
    [AuditTypeEnum.SQLI]: "red",
    [AuditTypeEnum.DDOS]: "orange",
    [AuditTypeEnum.BRUTEFORCE]: "blue",
    [AuditTypeEnum.WEB_TECHNOLOGIES]: "green",
    [AuditTypeEnum.ENDPOINT_DISCOVERY]: "grape",
    [AuditTypeEnum.XSS]: "violet",
    [AuditTypeEnum.HTTP_HEADER_IDENTIFICATION]: "cyan",
};