/**
 * Type représentant un audit.
 *
 * @typedef {Object} Audit
 * @property {number} id - Identifiant unique de l'audit.
 * @property {'pending' | 'in_progress' | 'completed' | 'failed' | 'refused'} status - Statut actuel de l'audit.
 */
export type Audit = {
    id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'refused';
};

/**
 * Interface représentant la charge utile pour demander un audit.
 *
 * @interface AuditRequestedPayload
 * @property {string} conversation_id - Identifiant de la conversation liée à l'audit.
 * @property {number} auditor_id - Identifiant de l'auditeur.
 * @property {number} company_id - Identifiant de l'entreprise.
 * @property {number} emitted_by - Identifiant de l'utilisateur ayant émis la demande.
 */
export interface AuditRequestedPayload {
    conversation_id: string;
    auditor_id: number;
    company_id: number;
    emitted_by: number;
}

/**
 * Interface représentant la charge utile transmise via socket pour un audit.
 *
 * @interface AuditSocketPayload
 * @property {number} auditor_id - Identifiant de l'auditeur.
 * @property {number} company_id - Identifiant de l'entreprise.
 * @property {number} audit_id - Identifiant unique de l'audit.
 * @property {'pending' | 'in_progress' | 'completed' | 'failed' | 'refused'} status - Statut actuel de l'audit.
 * @property {number} emitted_by - Identifiant de l'utilisateur ayant émis la demande.
 * @property {number} conversation_id - Identifiant de la conversation liée à l'audit.
 */
export interface AuditSocketPayload {
    auditor_id: number;
    company_id: number;
    audit_id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'refused';
    emitted_by: number;
    conversation_id: number;
}