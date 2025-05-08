import { Center, Loader as MantineLoader } from "@mantine/core";

export const Loader = () => {
    return (
        <Center style={{ position: 'absolute', top: '50%', right: '40%' }}>
            <MantineLoader size="xl" variant="dots" />
        </Center>
    );
};
