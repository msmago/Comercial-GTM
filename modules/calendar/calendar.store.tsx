
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CalendarState, CommercialEvent } from './calendar.types';
import { CalendarService } from './calendar.service';
import { useAuth } from '../auth/auth.store';

interface CalendarContextType extends CalendarState {
  refresh: () => Promise<void>;
  saveEvent: (e: Partial<CommercialEvent>) => Promise<{ success: boolean; error?: string }>;
  removeEvent: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<CalendarState>({ events: [], loading: false });

  const refresh = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));
    try {
      const events = await CalendarService.getEvents();
      setState({ events, loading: false });
    } catch (error) {
      console.error("Falha ao carregar calendário:", error);
      setState(s => ({ ...s, loading: false }));
    }
  }, [user]);

  useEffect(() => { 
    if (user) refresh(); 
  }, [user, refresh]);

  const saveEvent = async (e: Partial<CommercialEvent>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    try {
      const response = await CalendarService.upsertEvent(e, { id: user.id, name: user.name });
      
      if (response.error) {
        // Log detalhado para depuração no console do navegador
        console.error("Erro Supabase:", response.error);
        const msg = response.error.message || 'Erro desconhecido no banco de dados';
        const details = response.error.details ? ` (${response.error.details})` : '';
        throw new Error(`${msg}${details}`);
      }
      
      await refresh();
      return { success: true };
    } catch (error: any) {
      console.error("Erro detalhado ao salvar evento:", error);
      
      let errorMessage = 'Ocorreu um erro inesperado';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const removeEvent = async (id: string) => {
    try {
      const { error } = await CalendarService.deleteEvent(id);
      if (error) throw error;
      await refresh();
    } catch (error) {
      console.error("Erro ao remover evento:", error);
    }
  };

  return (
    <CalendarContext.Provider value={{ ...state, refresh, saveEvent, removeEvent }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used within CalendarProvider');
  return context;
};
