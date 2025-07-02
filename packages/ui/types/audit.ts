export type Audit = {
    id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'refused';
};

export interface AuditRequestedPayload {
    conversation_id: string;
    auditor_id: number;
    company_id: number;
    emitted_by: number;
}

export interface AuditSocketPayload {
    auditor_id: number;
    company_id: number;
    audit_id: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'refused';
    emitted_by: number;
    conversation_id: number;
}
