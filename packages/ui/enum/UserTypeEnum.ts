/**
 * Enumération des types d'utilisateur.
 *
 * Cette énumération définit les différents types d'utilisateur disponibles dans l'application.
 *
 * @enum {string}
 * @property {string} COMPANY - Représente une entreprise.
 * @property {string} AUDITOR - Représente un auditeur.
 * @property {string} ADMIN - Représente un administrateur.
 */
export enum UserTypeEnum {
    COMPANY = "company",
    AUDITOR = "auditor",
    ADMIN = "admin",
}

/**
 * Labels des types d'utilisateur.
 *
 * Cet objet associe chaque type d'utilisateur à son label en français.
 * Il est utilisé pour afficher des noms de type utilisateur compréhensibles dans l'interface utilisateur.
 *
 * @type {Record<UserTypeEnum, string>}
 * @property {string} company - "Entreprise" (label pour le type COMPANY).
 * @property {string} auditor - "Auditeur" (label pour le type AUDITOR).
 * @property {string} admin - "Administrateur" (label pour le type ADMIN).
 */
export const UserTypeLabel: Record<UserTypeEnum, string> = {
    [UserTypeEnum.COMPANY]: "Entreprise",
    [UserTypeEnum.AUDITOR]: "Auditeur",
    [UserTypeEnum.ADMIN]: "Administrateur",
};