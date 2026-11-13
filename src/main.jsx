import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/dynapuff/600.css';
import '@fontsource/dynapuff/700.css';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource/atkinson-hyperlegible-mono/500.css';
import '@fontsource/atkinson-hyperlegible-mono/600.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/skin.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
