import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@mantine/core/styles.css';
import {MantineProvider} from '@mantine/core';

import App from './App';
import './style.css';
import './App.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Element #root not found");

createRoot(rootElement).render(
    <StrictMode>
        <MantineProvider defaultColorScheme="auto">
            <App/>
        </MantineProvider>
    </StrictMode>
);
