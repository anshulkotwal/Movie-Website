import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Import the main App component
import { AuthProvider } from './components/AuthContext'; // Correctly import AuthProvider
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import './index.css'; // Assuming you have an index.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
