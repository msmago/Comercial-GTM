
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
  FileSpreadsheet
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
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </Link>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/60 glass sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-xl italic text-white">GP</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">GTM PRO</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <SidebarLink to="/" icon={LayoutDashboard} label="Painel de Controle" active={location.pathname === '/'} />
          <SidebarLink to="/crm" icon={Users} label="Hub de Parceiros" active={location.pathname === '/crm'} />
          <SidebarLink to="/tasks" icon={KanbanIcon} label="Fluxo Operacional" active={location.pathname === '/tasks'} />
          <SidebarLink to="/calendar" icon={CalendarIcon} label="Agenda Comercial" active={location.pathname === '/calendar'} />
          <SidebarLink to="/inventory" icon={Package} label="Almoxarifado" active={location.pathname === '/inventory'} />
          <SidebarLink to="/sheets" icon={FileSpreadsheet} label="Planilhas Estratégicas" active={location.pathname === '/sheets'} />
          <div className="h-px bg-slate-800/60 my-4 mx-2" />
          <SidebarLink to="/ai" icon={BrainCircuit} label="GTM AI Agent" active={location.pathname === '/ai'} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 glass border-b border-slate-800/60 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <button className="lg:hidden text-slate-400" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <h2 className="text-lg font-semibold text-slate-300 hidden sm:block">
            {location.pathname === '/' ? 'Dashboard Estratégico' : 
             location.pathname === '/crm' ? 'Gestão de Parceiros (CRM)' : 
             location.pathname === '/tasks' ? 'Pipeline Operacional' : 
             location.pathname === '/calendar' ? 'Calendário de Eventos' : 
             location.pathname === '/inventory' ? 'Controle de Almoxarifado' : 
             location.pathname === '/sheets' ? 'Planilhas Google' : 'Inteligência Artificial'}
          </h2>

          <div className="flex items-center gap-3">
            <a 
              href="https://gemini.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10"
              title="Ir para Google Gemini"
            >
              <Sparkles size={18} />
            </a>
            <a 
              href="https://www.lovart.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
              title="Ir para Lovart AI"
            >
              <Zap size={18} />
            </a>
          </div>
        </header>

        <div className="p-6 lg:p-10 animate-in fade-in duration-500 overflow-auto h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden">
          <div className="w-72 h-full glass border-r border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">G</div>
                <h1 className="text-lg font-bold">GTM PRO</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400"><X size={24} /></button>
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
