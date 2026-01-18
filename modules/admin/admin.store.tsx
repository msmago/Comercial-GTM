
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminStats, ConsultantPerformance } from './admin.types';
import { AdminService } from './admin.service';
import { useAuth } from '../auth/auth.store';

interface AdminContextType {
  stats: AdminStats | null;
  consultants: ConsultantPerformance[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [consultants, setConsultants] = useState<ConsultantPerformance[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        AdminService.getGlobalStats(),
        AdminService.getConsultantsPerformance()
      ]);
      setStats(s);
      setConsultants(c);
    } catch (error) {
      console.error("Admin Refresh Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminContext.Provider value={{ stats, consultants, loading, refresh }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
