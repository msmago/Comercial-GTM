
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Kanban as KanbanIcon, 
  Calendar as CalendarIcon, Package, FileSpreadsheet, 
  Star, ChevronRight, LogOut, ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../modules/auth/auth.store';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-5 py-4 rounded-[22px] transition-all duration-300 ${
      active 
        ? 'bg-slate-950 dark:bg-blue-600 text-white shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 translate-x-1' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-slate-200'
    }`}
  >
    <Icon size={20} className={`${active ? 'scale-110' : ''}`} />
    <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-40" />}
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/60 sticky top-0 h-screen p-8 z-40">
      <div className="flex items-center gap-4 mb-16 px-2">
        <div className="w-12 h-12 bg-slate-950 dark:bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <Star size={24} className="text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter italic uppercase leading-none">GTM PRO</h1>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600 mt-1">SaaS GTM</span>
        </div>
      </div>

      <nav className="flex flex-col gap-3 flex-grow overflow-y-auto pr-2">
        <SidebarLink to="/" icon={LayoutDashboard} label="Início" active={location.pathname === '/'} />
        <SidebarLink to="/crm" icon={Users} label="Parceiros" active={location.pathname === '/crm'} />
        <SidebarLink to="/tasks" icon={KanbanIcon} label="Fluxo" active={location.pathname === '/tasks'} />
        <SidebarLink to="/calendar" icon={CalendarIcon} label="Calendário" active={location.pathname === '/calendar'} />
        <SidebarLink to="/inventory" icon={Package} label="Estoque" active={location.pathname === '/inventory'} />
        <SidebarLink to="/sheets" icon={FileSpreadsheet} label="Planilhas" active={location.pathname === '/sheets'} />
        
        <div className="h-px bg-slate-100 dark:bg-slate-900 my-4 mx-2" />
        <div className="px-5 mb-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Utilidades</div>
        <SidebarLink to="/resources" icon={LinkIcon} label="Atalhos Críticos" active={location.pathname === '/resources'} />

        {user?.role === 'ADMIN' && (
          <>
            <div className="h-px bg-slate-100 dark:bg-slate-900 my-4 mx-2" />
            <div className="px-5 mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Administração</span>
            </div>
            <SidebarLink to="/admin" icon={ShieldCheck} label="Painel Admin" active={location.pathname.startsWith('/admin')} />
          </>
        )}
      </nav>

      <div className="mt-auto pt-6">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] text-slate-500 hover:text-rose-600 hover:border-rose-100 dark:hover:border-rose-900 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
        >
          <LogOut size={18} /> Encerrar Operação
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
