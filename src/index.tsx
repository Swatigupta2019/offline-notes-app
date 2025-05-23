import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import NotesPage from './pages/NotesPage';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <NotesPage />
  </React.StrictMode>
);

serviceWorkerRegistration.register();
