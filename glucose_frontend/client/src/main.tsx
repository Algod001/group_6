import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from '@/context/AuthContext'; // Import this!

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap App with AuthProvider so App can use useAuth() */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
