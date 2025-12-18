
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Capturador de erros global para ajudar no debug em produção
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Runtime Error:", message, "at", source, lineno, colno, error);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
