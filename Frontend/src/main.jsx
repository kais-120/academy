import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import theme from './theme/theme.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme} direction="rtl">
      <HashRouter>
        <App />
      </HashRouter>
    </ChakraProvider>
  </StrictMode>
);
