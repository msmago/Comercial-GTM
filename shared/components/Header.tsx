
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../modules/auth/auth.store';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('gtm_pro_theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gtm_pro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gtm_pro_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-90"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin')) return 'Gestão Estratégica';
    switch(location.pathname) {
      case '/': return 'Painel Analítico';
      case '/crm': return 'Gestão de Parceiros';
      case '/tasks': return 'Fluxo Operacional';
      case '/calendar': return 'Calendário Comercial';
      case '/inventory': return 'Gestão de Estoque';
      case '/sheets': return 'Central de Planilhas';
      case '/ai': return 'Inteligência Artificial';
      default: return 'Inteligência GTM';
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      default: return 'Consultor';
    }
  };

  return (
    <header className="h-24 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/40 flex items-center justify-between px-10 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <Menu size={24} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <ThemeToggle />
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[11px] font-black uppercase tracking-tight text-slate-950 dark:text-white leading-none">{user?.name}</p>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Nível {getRoleLabel(user?.role || '')}</p>
          </div>
          <div className="w-12 h-12 rounded-[20px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-slate-950 dark:text-white text-lg shadow-sm">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
