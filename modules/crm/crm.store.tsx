
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CRMState, Company } from './crm.types';
import { CRMService } from './crm.service';
import { useAuth } from '../auth/auth.store';

interface CRMContextType extends CRMState {
  refresh: () => Promise<void>;
  saveCompany: (c: Partial<Company>) => Promise<void>;
  removeCompany: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<CRMState>({ companies: [], loading: false });

  const refresh = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));
    const companies = await CRMService.getCompanies(user.id);
    setState({ companies, loading: false });
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const saveCompany = async (c: Partial<Company>) => {
    if (!user) return;
    await CRMService.upsertCompany(user.id, c);
    await refresh();
  };

  const removeCompany = async (id: string) => {
    if (!user) return;
    await CRMService.deleteCompany(user.id, id);
    await refresh();
  };

  return (
    <CRMContext.Provider value={{ ...state, refresh, saveCompany, removeCompany }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
};
