import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Quitamos <React.StrictMode> para evitar doble carga del reproductor
root.render(
    <App />
);