
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill para process.env para evitar que o app trave em ambientes de navegador puros
if (typeof window !== 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '',
      SUPABASE_URL: 'https://ottzppnrctbrtwsfgidr.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_RDXC_dqs-bANRVCa0klJFA_Ehm0dlpc'
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
