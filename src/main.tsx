/**
 * ============================================================================
 * Text-to-GIF Converter Application
 * ============================================================================
 * 
 * A client-side web application for creating animated text GIFs.
 * 
 * Features:
 * - Customizable text animations with typewriter reveal effect
 * - System font selection (Chrome/Edge) or web-safe fallback fonts
 * - Background transparency support
 * - Real-time preview canvas
 * - Direct GIF generation in browser (no server required)
 * 
 * Technology Stack:
 * - React 18 with TypeScript
 * - Vite for build tooling
 * - Canvas API for rendering
 * - gif.js for GIF encoding
 * 
 * @version V2 Stable
 * @author JBK - A Designer.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

/**
 * Application Version Information
 * Displayed in browser console for debugging and support purposes
 */
const APP_VERSION = {
  version: 'V2 Stable',
  build: 'dev',
  timestamp: new Date().toISOString()
};

console.log(
  '%c Text-to-GIF Converter by JBK - Version: ' + APP_VERSION.version + ' (Build: ' + APP_VERSION.build + ', Timestamp: ' + APP_VERSION.timestamp + ')',
  'background: #249E5E; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
  `${APP_VERSION.version}`
);

/**
 * Mount the React application to the DOM
 * Using StrictMode for development best practices
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
