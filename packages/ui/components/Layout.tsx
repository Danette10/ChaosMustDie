import {Outlet, useLocation} from "react-router-dom";
import {Container} from "@mantine/core";
import PageTransition from "./PageTransition";
import {Navbar} from "./Navbar";

/**
 * Layout Component
 *
 * This component provides the main layout structure for the application.
 * It includes a navigation bar, a container for page content, and handles page transitions.
 *
 * @returns {JSX.Element} The rendered layout component.
 */
export default function Layout() {
    const location = useLocation(); // Retrieves the current location object from React Router.

    return (
        <div style={{minHeight: "100vh"}}>
            <Navbar/> {/* Renders the navigation bar at the top of the layout. */}
            <Container py="md"> {/* Provides padding and wraps the page content. */}
                <PageTransition key={location.pathname}> {/* Handles animations for page transitions. */}
                    <Outlet/> {/* Renders the child routes defined in React Router. */}
                </PageTransition>
            </Container>
        </div>
    );
}