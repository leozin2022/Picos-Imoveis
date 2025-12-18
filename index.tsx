
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Capturador de erros global
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Runtime Error:", message, "at", source, lineno, colno, error);
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
