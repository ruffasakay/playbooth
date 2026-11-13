import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/marcellus-sc/400.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/caveat/600.css';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource-variable/literata';
import './styles/tokens.css';
import './styles/app.css';
import './styles/skin.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
