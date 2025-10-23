import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log('Index.jsx loading...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("No root element found!");
  throw new Error("Failed to find the root element");
}

console.log('Root element found, creating React root...');

const root = ReactDOM.createRoot(rootElement);

console.log('React root created, rendering App...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered successfully!');