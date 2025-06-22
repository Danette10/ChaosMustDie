import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import {MantineProvider} from "@mantine/core";
import './style.css';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <MantineProvider defaultColorScheme="auto">
          <App/>
      </MantineProvider>
  </StrictMode>,
)
