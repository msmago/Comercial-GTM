
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './modules/auth/auth.store';
import { KanbanProvider } from './modules/kanban/kanban.store';
import { CRMProvider } from './modules/crm/crm.store';
import { InventoryProvider } from './modules/inventory/inventory.store';
import { CalendarProvider } from './modules/calendar/calendar.store';
import { SheetsProvider } from './modules/sheets/sheets.store';
import { AdminProvider } from './modules/admin/admin.store';

// Componentes Shared
import Sidebar from './shared/components/Sidebar';
import Header from './shared/components/Header';

// Páginas
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Tasks from './pages/Tasks';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import Inventory from './pages/Inventory';
import Spreadsheets from './pages/Spreadsheets';
import AdminDashboard from './pages/AdminDashboard';
import AdminConsultants from './pages/AdminConsultants';
import Resources from './pages/Resources';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CRMProvider>
        <KanbanProvider>
          <InventoryProvider>
            <CalendarProvider>
              <SheetsProvider>
                <AdminProvider>
                  <Router>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
                      <Route path="/crm" element={<ProtectedLayout><CRM /></ProtectedLayout>} />
                      <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
                      <Route path="/calendar" element={<ProtectedLayout><CalendarPage /></ProtectedLayout>} />
                      <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
                      <Route path="/sheets" element={<ProtectedLayout><Spreadsheets /></ProtectedLayout>} />
                      <Route path="/resources" element={<ProtectedLayout><Resources /></ProtectedLayout>} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<ProtectedLayout><AdminDashboard /></ProtectedLayout>} />
                      <Route path="/admin/consultants" element={<ProtectedLayout><AdminConsultants /></ProtectedLayout>} />
                      
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Router>
                </AdminProvider>
              </SheetsProvider>
            </CalendarProvider>
          </InventoryProvider>
        </KanbanProvider>
      </CRMProvider>
    </AuthProvider>
  );
};

export default App;
