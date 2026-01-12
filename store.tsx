
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Company, Task, CommercialEvent, InventoryItem, AuditLog, User, 
  PipelineStatus, TaskStatus, TaskPriority, GoogleSheet 
} from './types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ottzppnrctbrtwsfgidr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_RDXC_dqs-bANRVCa0klJFA_Ehm0dlpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AppState {
  companies: Company[];
  tasks: Task[];
  events: CommercialEvent[];
  inventory: InventoryItem[];
  sheets: GoogleSheet[];
  logs: AuditLog[];
  user: User | null;
  loading: boolean;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  upsertCompany: (company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  upsertTask: (task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  upsertEvent: (event: Partial<CommercialEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  upsertInventory: (item: Partial<InventoryItem>) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  upsertSheet: (sheet: Partial<GoogleSheet>) => Promise<void>;
  deleteSheet: (id: string) => Promise<void>;
  logAction: (action: string, entity: string, entityId: string, details: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    companies: [],
    tasks: [],
    events: [],
    inventory: [],
    sheets: [],
    logs: [],
    user: null,
    loading: true,
  });

  const fetchData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const [
        { data: companiesRaw },
        { data: tasksRaw },
        { data: eventsRaw },
        { data: inventoryRaw },
        { data: sheetsRaw },
        { data: logsRaw }
      ] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('commercial_events').select('*').order('event_date', { ascending: true }),
        supabase.from('inventory').select('*').order('name', { ascending: true }),
        supabase.from('google_sheets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').eq('user_id', currentUser.id).order('timestamp', { ascending: false }).limit(100)
      ]);

      const mappedCompanies: Company[] = (companiesRaw || []).map(c => ({
        id: c.id,
        userId: c.user_id,
        name: c.name || 'Sem Nome',
        status: (c.status?.toUpperCase() || PipelineStatus.PROSPECT) as PipelineStatus,
        targetIES: c.target_ies || '',
        contacts: c.contacts || [],
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));

      const mappedTasks: Task[] = (tasksRaw || []).map(t => ({
        id: t.id,
        userId: t.user_id,
        title: t.title || 'Sem Título',
        description: t.description || '',
        status: (t.status?.toUpperCase() || TaskStatus.TODO) as TaskStatus,
        priority: (t.priority?.toUpperCase() || TaskPriority.MEDIUM) as TaskPriority,
        date: t.due_date,
        createdAt: t.created_at
      }));

      const mappedEvents: CommercialEvent[] = (eventsRaw || []).map(e => ({
        id: e.id,
        title: e.title || 'Sem Título',
        description: e.description || '',
        date: e.event_date,
        type: e.event_type as 'MANUAL' | 'AUTO_TASK',
        taskId: e.task_id,
        createdBy: e.created_by || 'Sistema'
      }));

      const mappedInventory: InventoryItem[] = (inventoryRaw || []).map(i => ({
        id: i.id,
        name: i.name || 'Sem Nome',
        category: i.category || 'Geral',
        quantity: i.quantity || 0,
        minQuantity: i.min_quantity || 0,
        lastUpdate: i.last_update
      }));

      const mappedSheets: GoogleSheet[] = (sheetsRaw || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        title: s.title || 'Sem Título',
        url: s.url || '',
        category: s.category || 'Geral',
        description: s.description || '',
        createdAt: s.created_at
      }));

      setState(prev => ({
        ...prev,
        companies: mappedCompanies,
        tasks: mappedTasks,
        events: mappedEvents,
        inventory: mappedInventory,
        sheets: mappedSheets,
        logs: logsRaw || [],
        loading: false
      }));
    } catch (error) {
      console.error('Erro crítico ao carregar dados:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('gtm_pro_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setState(prev => ({ ...prev, user: parsedUser }));
      fetchData(parsedUser);
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchData]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
      if (error || !data) return { success: false, message: 'E-mail ou senha incorretos.' };
      const user: User = { id: data.id, name: data.name, email: data.email, role: data.role as any };
      setState(prev => ({ ...prev, user }));
      localStorage.setItem('gtm_pro_user', JSON.stringify(user));
      await fetchData(user);
      return { success: true, message: 'Login realizado!' };
    } catch (err) {
      return { success: false, message: 'Erro ao tentar acessar.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existing) return { success: false, message: 'E-mail já cadastrado.' };
      const { data, error } = await supabase.from('users').insert([{ name, email, password, role: 'USER' }]).select().single();
      if (error) throw error;
      const user: User = { id: data.id, name: data.name, email: data.email, role: data.role as any };
      setState(prev => ({ ...prev, user }));
      localStorage.setItem('gtm_pro_user', JSON.stringify(user));
      await fetchData(user);
      return { success: true, message: 'Conta criada!' };
    } catch (err) {
      return { success: false, message: 'Erro ao criar conta.' };
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, companies: [], tasks: [], sheets: [], logs: [] }));
    localStorage.removeItem('gtm_pro_user');
  };

  const logAction = async (action: string, entity: string, entityId: string, details: string) => {
    if (!state.user) return;
    await supabase.from('audit_logs').insert([{
      user_id: state.user.id,
      action,
      entity,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const upsertTask = async (task: Partial<Task>) => {
    if (!state.user) return;
    const payload = {
      user_id: state.user.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.date || null
    };
    
    let taskId = task.id;
    if (taskId) {
      await supabase.from('tasks').update(payload).eq('id', taskId);
    } else {
      const { data } = await supabase.from('tasks').insert([payload]).select().single();
      taskId = data?.id;
    }
    
    if (task.date && taskId) {
      await supabase.from('commercial_events').upsert([{
        title: `Tarefa: ${task.title}`,
        description: task.description,
        event_date: task.date,
        event_type: 'AUTO_TASK',
        task_id: taskId,
        created_by: state.user.name
      }], { onConflict: 'task_id' });
    }
    await fetchData(state.user);
    await logAction(task.id ? 'UPDATE' : 'CREATE', 'Task', taskId || 'new', `Tarefa persistida.`);
  };

  const deleteTask = async (id: string) => {
    if (!state.user) return;
    await supabase.from('tasks').delete().eq('id', id);
    await supabase.from('commercial_events').delete().eq('task_id', id);
    await fetchData(state.user);
  };

  const upsertSheet = async (sheet: Partial<GoogleSheet>) => {
    if (!state.user) return;
    const payload = {
      user_id: state.user.id,
      title: sheet.title,
      url: sheet.url,
      category: sheet.category,
      description: sheet.description
    };
    
    if (sheet.id) {
      await supabase.from('google_sheets').update(payload).eq('id', sheet.id);
    } else {
      await supabase.from('google_sheets').insert([payload]);
    }
    await fetchData(state.user);
    await logAction(sheet.id ? 'UPDATE' : 'CREATE', 'GoogleSheet', sheet.id || 'new', `Planilha ${sheet.title} salva.`);
  };

  const deleteSheet = async (id: string) => {
    if (!state.user) return;
    await supabase.from('google_sheets').delete().eq('id', id);
    await fetchData(state.user);
  };

  const upsertCompany = async (company: Partial<Company>) => {
    if (!state.user) return;
    const payload = { user_id: state.user.id, name: company.name, status: company.status, target_ies: company.targetIES, contacts: company.contacts, updated_at: new Date().toISOString() };
    if (company.id) await supabase.from('companies').update(payload).eq('id', company.id);
    else await supabase.from('companies').insert([{ ...payload, created_at: new Date().toISOString() }]);
    await fetchData(state.user);
  };

  const deleteCompany = async (id: string) => {
    if (!state.user) return;
    await supabase.from('companies').delete().eq('id', id);
    await fetchData(state.user);
  };

  const upsertEvent = async (event: Partial<CommercialEvent>) => {
    if (!state.user) return;
    const payload = { title: event.title, description: event.description, event_date: event.date, event_type: event.type || 'MANUAL', created_by: state.user.name };
    if (event.id) await supabase.from('commercial_events').update(payload).eq('id', event.id);
    else await supabase.from('commercial_events').insert([payload]);
    await fetchData(state.user);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('commercial_events').delete().eq('id', id);
    if (state.user) await fetchData(state.user);
  };

  const upsertInventory = async (item: Partial<InventoryItem>) => {
    const payload = { name: item.name, category: item.category, quantity: item.quantity, min_quantity: item.minQuantity, last_update: new Date().toISOString() };
    if (item.id) await supabase.from('inventory').update(payload).eq('id', item.id);
    else await supabase.from('inventory').insert([payload]);
    if (state.user) await fetchData(state.user);
  };

  const deleteInventory = async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id);
    if (state.user) await fetchData(state.user);
  };

  return (
    <AppContext.Provider value={{ 
      ...state, login, register, logout, upsertCompany, deleteCompany, 
      upsertTask, deleteTask, upsertEvent, deleteEvent, upsertInventory, 
      deleteInventory, upsertSheet, deleteSheet, logAction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};
