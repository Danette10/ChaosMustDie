import { Badge, Button, Group, Paper, Text } from "@mantine/core";

interface AuditorCardProps {
    auditor: {
        id: string;
        name: string;
        email: string;
        audit_types: string[];
    };
    onContact: (auditor: any) => void;
}

const getBadgeColor = (type: string) => {
    switch (type) {
        case "SQLI": return "red";
        case "DDOS": return "orange";
        case "BRUTEFORCE": return "blue";
        case "WEB_TECHNOLOGIES": return "green";
        case "ENDPOINT_DISCOVERY": return "grape";
        case "XSS": return "violet";
        case "HTTP_HEADER_IDENTIFICATION": return "cyan";
        default: return "gray";
    }
};

export function AuditorCard({ auditor, onContact }: AuditorCardProps) {
    return (
        <Paper shadow="xs" p="md" withBorder>
            <Group position="apart" mb="xs" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <Text fw={600}>{auditor.name}</Text>
                <Button size="xs" onClick={() => onContact(auditor)}>Contacter</Button>
            </Group>
            <Text size="sm" c="dimmed">{auditor.email}</Text>
            <Group spacing="xs" mt="xs" wrap="wrap">
                {auditor.audit_types.map((type) => (
                    <Badge key={type} color={getBadgeColor(type)} variant="outline">
                        {type}
                    </Badge>
                ))}
            </Group>
        </Paper>
    );
}
