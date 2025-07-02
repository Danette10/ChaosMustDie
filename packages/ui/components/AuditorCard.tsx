import {Badge, Button, Group, Paper, Text} from "@mantine/core";
import {AuditTypeColors, AuditTypeEnum, AuditTypeLabels} from "../enum/AuditTypeEnum";

/**
 * Props for the AuditorCard component.
 *
 * @interface AuditorCardProps
 * @property {Object} auditor - Information about the auditor.
 * @property {string} auditor.id - Unique identifier for the auditor.
 * @property {string} auditor.name - Name of the auditor.
 * @property {string} auditor.email - Email address of the auditor.
 * @property {string[]} auditor.audit_types - List of audit types the auditor specializes in.
 * @property {(auditor: any) => void} onContact - Callback function triggered when the "Contacter" button is clicked.
 */
interface AuditorCardProps {
    auditor: {
        id: string;
        name: string;
        email: string;
        audit_types: string[];
    };
    onContact: (auditor: any) => void;
}

/**
 * AuditorCard Component
 *
 * This component displays information about an auditor, including their name, email, and audit types.
 * It also provides a button to contact the auditor.
 *
 * @param {AuditorCardProps} props - Props for the component.
 * @returns {JSX.Element} The rendered auditor card.
 */
export function AuditorCard({auditor, onContact}: AuditorCardProps) {
    return (
        <Paper shadow="xs" p="md" withBorder>
            {/* Header section with auditor's name and contact button */}
            <Group justify="space-between" mb="xs" style={{justifyContent: "space-between", alignItems: "center"}}>
                <Text fw={600}>{auditor.name}</Text>
                <Button size="xs" onClick={() => onContact(auditor)}>Contacter</Button>
            </Group>
            {/* Auditor's email */}
            <Text size="sm" c="dimmed">{auditor.email}</Text>
            {/* List of audit types with badges */}
            <Group gap="xs" mt="xs" wrap="wrap">
                {auditor.audit_types.map((type) => {
                    const enumKey = type as AuditTypeEnum;
                    return (
                        <Badge
                            key={type}
                            color={AuditTypeColors[enumKey] || "gray"}
                            variant="outline"
                        >
                            {AuditTypeLabels[enumKey] || type}
                        </Badge>
                    );
                })}
            </Group>
        </Paper>
    );
}