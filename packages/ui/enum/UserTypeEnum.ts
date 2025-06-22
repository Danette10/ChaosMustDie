export enum UserTypeEnum {
    COMPANY = "company",
    AUDITOR = "auditor",
    ADMIN = "admin",
}

export const UserTypeLabel: Record<UserTypeEnum, string> = {
    [UserTypeEnum.COMPANY]: "Entreprise",
    [UserTypeEnum.AUDITOR]: "Auditeur",
    [UserTypeEnum.ADMIN]: "Administrateur",
};
