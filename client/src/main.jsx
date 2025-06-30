// S3CURE_New/client/src/main.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // This imports YOUR main S3CURE React App component
import './index.css'; // This imports the global CSS file that came with Create React App

// Ensure your Firebase initialization file is in the 'src' folder
// or adjust path if it's in a subfolder like 'src/config/firebase.js'
import './firebase.js';

// Get the root element where your React app will be rendered
const rootElement = document.getElementById('root');

// Create a React root and render your App component
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);