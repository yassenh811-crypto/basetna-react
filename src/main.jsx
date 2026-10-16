/* ============================================================
   🚀 main.jsx
   ============================================================ */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/ai.css';
import './styles/print.css';
import App from './App.jsx';
import './styles/legacy.css';
import './styles/theme-i18n.css'; // لازم يكون آخر استيراد
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);