
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SheetsState, GoogleSheet } from './sheets.types';
import { SheetsService } from './sheets.service';
import { useAuth } from '../auth/auth.store';

interface SheetsContextType extends SheetsState {
  refresh: () => Promise<void>;
  saveSheet: (s: Partial<GoogleSheet>) => Promise<{ success: boolean; error?: any }>;
  removeSheet: (id: string) => Promise<void>;
}

const SheetsContext = createContext<SheetsContextType | undefined>(undefined);

export const SheetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<SheetsState>({ sheets: [], loading: false });

  const refresh = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));
    const sheets = await SheetsService.getSheets(user.id);
    setState({ sheets, loading: false });
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const saveSheet = async (s: Partial<GoogleSheet>) => {
    if (!user) return { success: false, error: 'Usuário não logado' };
    const { error } = await SheetsService.upsertSheet(user.id, s);
    if (error) return { success: false, error };
    await refresh();
    return { success: true };
  };

  const removeSheet = async (id: string) => {
    if (!user) return;
    await SheetsService.deleteSheet(user.id, id);
    await refresh();
  };

  return (
    <SheetsContext.Provider value={{ ...state, refresh, saveSheet, removeSheet }}>
      {children}
    </SheetsContext.Provider>
  );
};

export const useSheets = () => {
  const context = useContext(SheetsContext);
  if (!context) throw new Error('useSheets must be used within SheetsProvider');
  return context;
};
