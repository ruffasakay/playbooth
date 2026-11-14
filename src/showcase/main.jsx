import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource-variable/literata';
import '../styles/tokens.css';
import '../styles/app.css';
import '../styles/skin.css';
import './showcase.css';
import Showcase from './Showcase.jsx';

// the showcase is a daylight page; the booth itself opens at night
document.documentElement.dataset.theme = 'day';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
);
