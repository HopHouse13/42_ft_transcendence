import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Trouve la div#root du index.html et y monte le composant racine <App />
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
