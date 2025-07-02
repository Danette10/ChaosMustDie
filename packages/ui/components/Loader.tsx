import {Center, Loader as MantineLoader} from "@mantine/core";

/**
 * Loader Component
 *
 * This component displays a centered loading indicator using Mantine's Loader.
 * It is styled to appear in the middle of the screen.
 *
 * @returns {JSX.Element} The rendered loader component.
 */
export const Loader = () => {
    return (
        <Center style={{position: 'absolute', top: '50%', right: '40%'}}>
            <MantineLoader size="xl" variant="dots"/> {/* Displays a large loader with a "dots" variant. */}
        </Center>
    );
};