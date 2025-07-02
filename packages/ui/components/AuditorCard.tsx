import {Badge, Button, Group, Paper, Text} from "@mantine/core";
import {AuditTypeColors, AuditTypeEnum, AuditTypeLabels} from "../enum/AuditTypeEnum";

interface AuditorCardProps {
    auditor: {
        id: string;
        name: string;
        email: string;
        audit_types: string[];
    };
    onContact: (auditor: any) => void;
}

export function AuditorCard({auditor, onContact}: AuditorCardProps) {
    return (
        <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between" mb="xs" style={{justifyContent: "space-between", alignItems: "center"}}>
                <Text fw={600}>{auditor.name}</Text>
                <Button size="xs" onClick={() => onContact(auditor)}>Contacter</Button>
            </Group>
            <Text size="sm" c="dimmed">{auditor.email}</Text>
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
