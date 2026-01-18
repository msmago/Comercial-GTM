
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill para process.env aprimorado para não sobrescrever variáveis injetadas
if (typeof window !== 'undefined') {
  const existingProcess = (window as any).process || {};
  const existingEnv = existingProcess.env || {};
  
  (window as any).process = {
    ...existingProcess,
    env: {
      API_KEY: existingEnv.API_KEY || '',
      SUPABASE_URL: existingEnv.SUPABASE_URL || 'https://ottzppnrctbrtwsfgidr.supabase.co',
      SUPABASE_ANON_KEY: existingEnv.SUPABASE_ANON_KEY || 'sb_publishable_RDXC_dqs-bANRVCa0klJFA_Ehm0dlpc',
      ...existingEnv
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento root para montar a aplicação.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
