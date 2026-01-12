
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useStore } from './store';
import { 
  LayoutDashboard, 
  Users, 
  Kanban as KanbanIcon, 
  Calendar as CalendarIcon, 
  Package, 
  BrainCircuit, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Zap,
  FileSpreadsheet,
  GraduationCap,
  Star
} from 'lucide-react';

// Páginas
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/CalendarPage';
import Inventory from './pages/Inventory';
import AIAgent from './pages/AIAgent';
import Spreadsheets from './pages/Spreadsheets';
import LoginPage from './pages/LoginPage';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
      <Icon size={20} />
    </div>
    <span className="font-medium text-sm">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </Link>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/40 glass sticky top-0 h-screen p-6 z-40">
        <Link to="/" className="flex items-center gap-3 mb-12 px-2 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all duration-500 group-hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] group-hover:-rotate-6">
            <Star size={24} className="text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white leading-none italic">GTM PRO</h1>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mt-1">Enterprise</span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1.5 flex-grow">
          <SidebarLink to="/" icon={LayoutDashboard} label="Painel de Controle" active={location.pathname === '/'} />
          <SidebarLink to="/crm" icon={Users} label="Hub de Parceiros" active={location.pathname === '/crm'} />
          <SidebarLink to="/tasks" icon={KanbanIcon} label="Fluxo Operacional" active={location.pathname === '/tasks'} />
          <SidebarLink to="/calendar" icon={CalendarIcon} label="Agenda Comercial" active={location.pathname === '/calendar'} />
          <SidebarLink to="/inventory" icon={Package} label="Almoxarifado" active={location.pathname === '/inventory'} />
          <SidebarLink to="/sheets" icon={FileSpreadsheet} label="Planilhas Estratégicas" active={location.pathname === '/sheets'} />
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4 mx-2" />
          <SidebarLink to="/ai" icon={BrainCircuit} label="GTM AI Agent" active={location.pathname === '/ai'} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-3 mb-6 p-3 rounded-2xl bg-slate-900/30 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-blue-400 font-bold border border-slate-700 shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black uppercase tracking-tight truncate text-slate-100">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate italic">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 glass border-b border-slate-800/40 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 hidden sm:block">
            {location.pathname === '/' ? 'Monitoramento Estratégico' : 
             location.pathname === '/crm' ? 'Gerenciamento de Parceiros' : 
             location.pathname === '/tasks' ? 'Fluxo de Atividades' : 
             location.pathname === '/calendar' ? 'Calendário Comercial' : 
             location.pathname === '/inventory' ? 'Inventário de Apoio' : 
             location.pathname === '/sheets' ? 'Planilhas Google' : 'Inteligência Artificial'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-800/60">
              <a 
                href="https://funepi.educasystem.com.br/adm/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-400 transition-all shadow-lg"
                title="Portal Funepi"
              >
                <GraduationCap size={18} />
              </a>
              <a 
                href="https://gemini.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white hover:border-blue-400 transition-all shadow-lg"
                title="Google Gemini"
              >
                <Sparkles size={18} />
              </a>
              <a 
                href="https://www.lovart.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-400 transition-all shadow-lg"
                title="Lovart AI"
              >
                <Zap size={18} />
              </a>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Servidor Online
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 animate-in fade-in duration-700 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md lg:hidden">
          <div className="w-72 h-full glass border-r border-slate-800 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center p-2 shadow-lg shadow-blue-500/20">
                   <Star size={20} className="text-white fill-white" />
                </div>
                <h1 className="text-xl font-black italic tracking-tighter">GTM PRO</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 hover:text-white p-2"><X size={24} /></button>
            </div>
            <nav className="flex flex-col gap-2" onClick={() => setMobileMenuOpen(false)}>
              <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
              <SidebarLink to="/crm" icon={Users} label="CRM" active={location.pathname === '/crm'} />
              <SidebarLink to="/tasks" icon={KanbanIcon} label="Kanban" active={location.pathname === '/tasks'} />
              <SidebarLink to="/calendar" icon={CalendarIcon} label="Calendário" active={location.pathname === '/calendar'} />
              <SidebarLink to="/inventory" icon={Package} label="Estoque" active={location.pathname === '/inventory'} />
              <SidebarLink to="/sheets" icon={FileSpreadsheet} label="Planilhas" active={location.pathname === '/sheets'} />
              <SidebarLink to="/ai" icon={BrainCircuit} label="GTM AI" active={location.pathname === '/ai'} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sheets" element={<Spreadsheets />} />
            <Route path="/ai" element={<AIAgent />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
};

export default App;
