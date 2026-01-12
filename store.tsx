
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Company, Task, CommercialEvent, InventoryItem, AuditLog, User, 
  PipelineStatus, TaskStatus, GoogleSheet 
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
        { data: companies },
        { data: tasks },
        { data: events },
        { data: inventory },
        { data: sheets },
        { data: logs }
      ] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('commercial_events').select('*').order('event_date', { ascending: true }),
        supabase.from('inventory').select('*').order('name', { ascending: true }),
        supabase.from('google_sheets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').eq('user_id', currentUser.id).order('timestamp', { ascending: false }).limit(100)
      ]);

      setState(prev => ({
        ...prev,
        companies: companies || [],
        tasks: tasks || [],
        events: events || [],
        inventory: inventory || [],
        sheets: sheets || [],
        logs: logs || [],
        loading: false
      }));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  useEffect(() => {
    if (!state.user) return;

    const channel = supabase.channel('gtm_pro_changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData(state.user))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData, state.user]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, message: 'E-mail ou senha incorretos.' };
      }

      const user: User = { id: data.id, name: data.name, email: data.email, role: data.role };
      setState(prev => ({ ...prev, user }));
      localStorage.setItem('gtm_pro_user', JSON.stringify(user));
      fetchData(user);
      return { success: true, message: 'Login realizado com sucesso!' };
    } catch (err) {
      return { success: false, message: 'Erro ao tentar acessar.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existing) {
        return { success: false, message: 'Este e-mail já está cadastrado.' };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email, password, role: 'USER' }])
        .select()
        .single();

      if (error) throw error;

      const user: User = { id: data.id, name: data.name, email: data.email, role: data.role };
      setState(prev => ({ ...prev, user }));
      localStorage.setItem('gtm_pro_user', JSON.stringify(user));
      fetchData(user);
      return { success: true, message: 'Conta criada com sucesso!' };
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

  const upsertCompany = async (company: Partial<Company>) => {
    if (!state.user) return;
    const payload = {
      user_id: state.user.id,
      name: company.name,
      status: company.status,
      target_ies: company.targetIES,
      contacts: company.contacts,
      updated_at: new Date().toISOString()
    };
    
    if (company.id) {
      await supabase.from('companies').update(payload).eq('id', company.id).eq('user_id', state.user.id);
    } else {
      await supabase.from('companies').insert([{ ...payload, created_at: new Date().toISOString() }]);
    }
    await logAction(company.id ? 'UPDATE' : 'CREATE', 'Company', company.id || 'new', `Empresa ${company.name} atualizada.`);
  };

  const deleteCompany = async (id: string) => {
    if (!state.user) return;
    await supabase.from('companies').delete().eq('id', id).eq('user_id', state.user.id);
    await logAction('DELETE', 'Company', id, `Empresa removida.`);
  };

  const upsertTask = async (task: Partial<Task>) => {
    if (!state.user) return;
    const payload = {
      user_id: state.user.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.date
    };
    
    let taskId = task.id;
    if (task.id) {
      await supabase.from('tasks').update(payload).eq('id', task.id).eq('user_id', state.user.id);
    } else {
      const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
      if (error) throw error;
      taskId = data.id;
    }
    
    if (task.date && taskId) {
      await supabase.from('commercial_events').upsert([{
        title: `Task: ${task.title}`,
        description: task.description,
        event_date: task.date,
        event_type: 'AUTO_TASK',
        task_id: taskId,
        created_by: state.user.name
      }], { onConflict: 'task_id' });
    }
    await logAction(task.id ? 'UPDATE' : 'CREATE', 'Task', taskId || 'new', `Tarefa sincronizada.`);
  };

  const deleteTask = async (id: string) => {
    if (!state.user) return;
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', state.user.id);
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
      await supabase.from('google_sheets').update(payload).eq('id', sheet.id).eq('user_id', state.user.id);
    } else {
      await supabase.from('google_sheets').insert([payload]);
    }
  };

  const deleteSheet = async (id: string) => {
    if (!state.user) return;
    await supabase.from('google_sheets').delete().eq('id', id).eq('user_id', state.user.id);
  };

  const upsertEvent = async (event: Partial<CommercialEvent>) => {
    if (!state.user) return;
    const payload = {
      title: event.title,
      description: event.description,
      event_date: event.date,
      event_type: event.type || 'MANUAL',
      created_by: state.user.name
    };
    if (event.id) {
      await supabase.from('commercial_events').update(payload).eq('id', event.id);
    } else {
      await supabase.from('commercial_events').insert([payload]);
    }
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('commercial_events').delete().eq('id', id);
  };

  const upsertInventory = async (item: Partial<InventoryItem>) => {
    const payload = {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      last_update: new Date().toISOString()
    };
    if (item.id) {
      await supabase.from('inventory').update(payload).eq('id', item.id);
    } else {
      await supabase.from('inventory').insert([payload]);
    }
  };

  const deleteInventory = async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id);
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      login, 
      register,
      logout, 
      upsertCompany, 
      deleteCompany, 
      upsertTask, 
      deleteTask,
      upsertEvent,
      deleteEvent,
      upsertInventory,
      deleteInventory,
      upsertSheet,
      deleteSheet,
      logAction
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
