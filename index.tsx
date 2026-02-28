import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

import { ThemeProvider } from './contexts/ThemeContext';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);