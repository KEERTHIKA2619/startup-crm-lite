import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LeadProvider } from './context/LeadContext.jsx';

// Initialize and mount the React application on the DOM element with ID 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LeadProvider>
        <App />
      </LeadProvider>
    </ThemeProvider>
  </StrictMode>
);

