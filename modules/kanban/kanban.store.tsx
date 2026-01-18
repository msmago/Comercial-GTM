
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { KanbanState, Task, KanbanColumn, TaskPriority } from './kanban.types';
import { KanbanService } from './kanban.service';
import { useAuth } from '../auth/auth.store';

interface KanbanContextType extends KanbanState {
  refresh: () => Promise<void>;
  saveTask: (t: Partial<Task>) => Promise<{ success: boolean; error?: any }>;
  removeTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatusId: string) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

// Estrutura padrão imutável para GTM PRO
const GTM_STANDARD_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', userId: 'system', title: 'Backlog Operacional', color: 'bg-slate-900', order: 0 },
  { id: 'todo', userId: 'system', title: 'Em Execução', color: 'bg-blue-600', order: 1 },
  { id: 'done', userId: 'system', title: 'Finalizado', color: 'bg-emerald-600', order: 2 },
];

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<KanbanState>({ 
    columns: GTM_STANDARD_COLUMNS, 
    tasks: [], 
    loading: false 
  });

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setState(s => ({ ...s, loading: true }));
    
    try {
      const tasks = await KanbanService.getTasks(user.id);
      
      // Sanitização: Se alguma tarefa tiver status inválido, move para o backlog
      const sanitizedTasks = (tasks || []).map(t => {
        const isValidStatus = GTM_STANDARD_COLUMNS.some(c => c.id === t.status);
        return {
          ...t,
          status: isValidStatus ? t.status : 'backlog'
        };
      });

      setState(s => ({ 
        ...s,
        tasks: sanitizedTasks, 
        loading: false 
      }));
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
      setState(s => ({ ...s, loading: false }));
    }
  }, [user?.id]);

  useEffect(() => { 
    if (user?.id) {
      refresh();
    } else {
      setState(s => ({ ...s, tasks: [], loading: false }));
    }
  }, [user?.id, refresh]);

  const saveTask = async (t: Partial<Task>) => {
    if (!user) return { success: false, error: 'Auth error' };
    const result = await KanbanService.upsertTask(user.id, t);
    await refresh();
    return result;
  };

  const removeTask = async (id: string) => {
    if (!user) return;
    await KanbanService.deleteTask(user.id, id);
    await refresh();
  };

  const moveTask = async (taskId: string, newStatusId: string) => {
    if (!user) return;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatusId) return;

    // Atualização Otimista
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatusId } : t)
    }));

    await KanbanService.upsertTask(user.id, { ...task, status: newStatusId });
  };

  return (
    <KanbanContext.Provider value={{ 
      ...state, 
      refresh, 
      saveTask, 
      removeTask, 
      moveTask 
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error('useKanban must be used within KanbanProvider');
  return context;
};
