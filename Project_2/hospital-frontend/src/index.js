import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Removed StrictMode — it mounts components twice in dev
// which causes AuthContext to initialize twice and wipe localStorage
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
