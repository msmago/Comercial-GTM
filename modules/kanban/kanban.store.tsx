
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { KanbanState, Task, KanbanColumn } from './kanban.types';
import { KanbanService } from './kanban.service';
import { useAuth } from '../auth/auth.store';

interface KanbanContextType extends KanbanState {
  refresh: () => Promise<void>;
  saveTask: (t: Partial<Task>) => Promise<{ success: boolean; error?: any }>;
  removeTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatusId: string) => Promise<void>;
  saveColumn: (c: Partial<KanbanColumn>) => Promise<{ success: boolean; error?: any }>;
  removeColumn: (id: string) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<KanbanState>({ columns: [], tasks: [], loading: false });

  const refresh = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));
    try {
      const [cols, tasks] = await Promise.all([
        KanbanService.getColumns(user.id),
        KanbanService.getTasks(user.id)
      ]);
      
      const safeCols = cols || [];
      const safeTasks = tasks || [];

      const sanitizedTasks = safeTasks.map(t => {
        const columnExists = safeCols.some(c => c.id === t.status);
        return {
          ...t,
          status: columnExists ? t.status : (safeCols[0]?.id || '')
        };
      });

      setState({ 
        columns: safeCols, 
        tasks: sanitizedTasks, 
        loading: false 
      });
    } catch (error: any) {
      const msg = error?.message || JSON.stringify(error);
      console.error("Erro ao carregar dados do Kanban na Store:", msg);
      setState(s => ({ ...s, loading: false }));
    }
  }, [user]);

  useEffect(() => { 
    if (user) refresh(); 
  }, [user, refresh]);

  const saveTask = async (t: Partial<Task>) => {
    if (!user) return { success: false, error: 'Usuário não logado' };
    try {
      await KanbanService.upsertTask(user.id, t);
      await refresh();
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error("Erro na Store ao salvar tarefa:", errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const removeTask = async (id: string) => {
    if (!user) return;
    
    // Captura estado anterior para reversão em caso de erro
    const previousTasks = [...state.tasks];
    
    try {
      // 1. Atualização Otimista: Remove da UI imediatamente
      setState(s => ({
        ...s,
        tasks: s.tasks.filter(t => t.id !== id)
      }));
      
      // 2. Executa exclusão no servidor
      await KanbanService.deleteTask(user.id, id);
      
      // 3. Opcionalmente atualiza para garantir sincronia (pode ser skipado se a UI já estiver ok)
      // await refresh(); 
    } catch (error: any) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error("Falha ao apagar tarefa na Store:", errorMsg);
      
      // Reverte o estado se falhar no servidor
      setState(s => ({ ...s, tasks: previousTasks }));
      alert(`Erro ao excluir ticket: ${errorMsg}`);
    }
  };

  const moveTask = async (taskId: string, newStatusId: string) => {
    if (!user) return;
    const previousTasks = [...state.tasks];
    try {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.status === newStatusId) return;

      setState(s => ({
        ...s,
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatusId } : t)
      }));

      await KanbanService.upsertTask(user.id, { ...task, status: newStatusId });
    } catch (error: any) {
      const msg = error.message || JSON.stringify(error);
      console.error("Erro ao mover card:", msg);
      setState(s => ({ ...s, tasks: previousTasks }));
      await refresh();
    }
  };

  const saveColumn = async (c: Partial<KanbanColumn>) => {
    if (!user) return { success: false, error: 'Usuário não logado' };
    try {
      await KanbanService.upsertColumn(user.id, c);
      await refresh();
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.message || JSON.stringify(error);
      return { success: false, error: errorMsg };
    }
  };

  const removeColumn = async (id: string) => {
    if (!user) return;
    try {
      await KanbanService.deleteColumn(user.id, id);
      await refresh();
    } catch (error: any) {
      const msg = error.message || JSON.stringify(error);
      console.error("Erro ao apagar coluna:", msg);
    }
  };

  return (
    <KanbanContext.Provider value={{ 
      ...state, 
      refresh, 
      saveTask, 
      removeTask, 
      moveTask,
      saveColumn, 
      removeColumn 
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error('useKanban deve ser usado dentro de um KanbanProvider');
  return context;
};
