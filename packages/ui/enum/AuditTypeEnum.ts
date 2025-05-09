export enum AuditTypeEnum {
    SQLI = "SQLI",
    DDOS = "DDOS",
    BRUTEFORCE = "BRUTEFORCE",
    WEB_TECHNOLOGIES = "WEB_TECHNOLOGIES",
    ENDPOINT_DISCOVERY = "ENDPOINT_DISCOVERY",
    XSS = "XSS",
    HTTP_HEADER_IDENTIFICATION = "HTTP_HEADER_IDENTIFICATION",
}

export const AuditTypeLabels: Record<AuditTypeEnum, string> = {
    [AuditTypeEnum.SQLI]: "Injection SQL",
    [AuditTypeEnum.DDOS]: "DDOS",
    [AuditTypeEnum.BRUTEFORCE]: "Bruteforce",
    [AuditTypeEnum.WEB_TECHNOLOGIES]: "Découverte des technologies web",
    [AuditTypeEnum.ENDPOINT_DISCOVERY]: "Découverte d'endpoint",
    [AuditTypeEnum.XSS]: "Cross-site scripting (XSS)",
    [AuditTypeEnum.HTTP_HEADER_IDENTIFICATION]: "Identification des entêtes HTTP",
};

export const AuditTypeColors: Record<AuditTypeEnum, string> = {
    [AuditTypeEnum.SQLI]: "red",
    [AuditTypeEnum.DDOS]: "orange",
    [AuditTypeEnum.BRUTEFORCE]: "blue",
    [AuditTypeEnum.WEB_TECHNOLOGIES]: "green",
    [AuditTypeEnum.ENDPOINT_DISCOVERY]: "grape",
    [AuditTypeEnum.XSS]: "violet",
    [AuditTypeEnum.HTTP_HEADER_IDENTIFICATION]: "cyan",
};