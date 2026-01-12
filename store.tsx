
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Company, Task, CommercialEvent, InventoryItem, AuditLog, User, 
  PipelineStatus, TaskStatus, TaskPriority, GoogleSheet 
} from './types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ottzppnrctbrtwsfgidr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_RDXC_dqs-bANRVCa0klJFA_Ehm0dlpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FULL_SETUP_SQL = `
CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'USER', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS companies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id), name TEXT, status TEXT, target_ies TEXT, contacts JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id), title TEXT, description TEXT, status TEXT, priority TEXT, due_date TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS commercial_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT, description TEXT, event_date TIMESTAMPTZ, event_type TEXT, task_id UUID REFERENCES tasks(id), created_by TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS google_sheets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id), title TEXT, url TEXT, category TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS inventory (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, category TEXT, quantity INTEGER DEFAULT 0, min_quantity INTEGER DEFAULT 0, last_update TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id), action TEXT, entity TEXT, entity_id TEXT, timestamp TIMESTAMPTZ DEFAULT now(), details TEXT);

ALTER TABLE commercial_events REPLICA IDENTITY FULL;
`;

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
  upsertCompany: (company: Partial<Company>) => Promise<{ success: boolean; error?: any }>;
  deleteCompany: (id: string) => Promise<void>;
  upsertTask: (task: Partial<Task>) => Promise<{ success: boolean; error?: any }>;
  deleteTask: (id: string) => Promise<void>;
  upsertEvent: (event: Partial<CommercialEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  upsertInventory: (item: Partial<InventoryItem>) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  upsertSheet: (sheet: Partial<GoogleSheet>) => Promise<{ success: boolean; error?: any }>;
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
        resCompanies,
        resTasks,
        resEvents,
        resInventory,
        resSheets,
        resLogs
      ] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('commercial_events').select('*').order('event_date', { ascending: true }),
        supabase.from('inventory').select('*').order('name', { ascending: true }),
        supabase.from('google_sheets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').eq('user_id', currentUser.id).order('timestamp', { ascending: false }).limit(50)
      ]);

      setState(prev => ({
        ...prev,
        companies: (resCompanies.data || []).map(c => ({
          id: c.id,
          userId: c.user_id,
          name: c.name || 'Sem Nome',
          status: (c.status?.toUpperCase() || PipelineStatus.PROSPECT) as PipelineStatus,
          targetIES: c.target_ies || '',
          contacts: c.contacts || [],
          createdAt: c.created_at,
          updatedAt: c.updated_at
        })),
        tasks: (resTasks.data || []).map(t => ({
          id: t.id,
          userId: t.user_id,
          title: t.title || 'Sem Título',
          description: t.description || '',
          status: (t.status?.toUpperCase() || TaskStatus.TODO) as TaskStatus,
          priority: (t.priority?.toUpperCase() || TaskPriority.MEDIUM) as TaskPriority,
          date: t.due_date,
          createdAt: t.created_at
        })),
        sheets: (resSheets.data || []).map(s => ({
          id: s.id,
          userId: s.user_id,
          title: s.title || 'Sem Título',
          url: s.url || '',
          category: s.category || 'Geral',
          description: s.description || '',
          createdAt: s.created_at
        })),
        events: (resEvents.data || []).map(e => ({ 
          id: e.id, 
          title: e.title, 
          description: e.description, 
          date: e.event_date, 
          type: e.event_type, 
          taskId: e.task_id, 
          createdBy: e.created_by || 'Sistema' 
        })),
        inventory: (resInventory.data || []).map(i => ({ id: i.id, name: i.name, category: i.category, quantity: i.quantity, minQuantity: i.min_quantity, lastUpdate: i.last_update })),
        logs: resLogs.data || [],
        loading: false
      }));
    } catch (error) {
      console.error('Fetch error:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('gtm_pro_user');
    if (saved) {
      const u = JSON.parse(saved);
      setState(prev => ({ ...prev, user: u }));
      fetchData(u);

      // REALTIME SUBSCRIPTION PARA RANKING VIVO
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'commercial_events' },
          () => {
            console.log('🔄 Sincronização em tempo real ativada...');
            fetchData(u);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchData]);

  const upsertTask = async (task: Partial<Task>) => {
    if (!state.user) return { success: false, error: "Usuário não logado" };
    const payload: any = { user_id: state.user.id, title: task.title, description: task.description || '', status: task.status || TaskStatus.TODO, priority: task.priority || TaskPriority.MEDIUM, due_date: task.date || null };
    try {
      let result;
      if (task.id && task.id !== "") result = await supabase.from('tasks').update(payload).eq('id', task.id).eq('user_id', state.user.id);
      else result = await supabase.from('tasks').insert([payload]).select().single();
      
      const taskId = task.id || result.data?.id;
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
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const upsertSheet = async (sheet: Partial<GoogleSheet>) => {
    if (!state.user) return { success: false, error: "Usuário não logado" };
    const payload: any = { user_id: state.user.id, title: sheet.title, url: sheet.url, category: sheet.category, description: sheet.description || '' };
    try {
      if (sheet.id && sheet.id !== "") await supabase.from('google_sheets').update(payload).eq('id', sheet.id).eq('user_id', state.user.id);
      else await supabase.from('google_sheets').insert([payload]);
      await fetchData(state.user);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const deleteSheet = async (id: string) => {
    if (!state.user) return;
    await supabase.from('google_sheets').delete().eq('id', id).eq('user_id', state.user.id);
    await fetchData(state.user);
  };

  const deleteTask = async (id: string) => {
    if (!state.user) return;
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', state.user.id);
    await supabase.from('commercial_events').delete().eq('task_id', id);
    await fetchData(state.user);
  };

  const login = async (e: string, p: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', e).eq('password', p).single();
    if (error || !data) return { success: false, message: 'Credenciais inválidas' };
    const u: User = { id: data.id, name: data.name, email: data.email, role: data.role as any };
    setState(prev => ({ ...prev, user: u }));
    localStorage.setItem('gtm_pro_user', JSON.stringify(u));
    await fetchData(u);
    return { success: true, message: 'Ok' };
  };

  const register = async (n: string, e: string, p: string) => {
    const { data, error } = await supabase.from('users').insert([{ name: n, email: e, password: p, role: 'USER' }]).select().single();
    if (error) return { success: false, message: 'Erro ao registrar' };
    const u: User = { id: data.id, name: data.name, email: data.email, role: data.role as any };
    setState(prev => ({ ...prev, user: u }));
    localStorage.setItem('gtm_pro_user', JSON.stringify(u));
    await fetchData(u);
    return { success: true, message: 'Ok' };
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, companies: [], tasks: [], sheets: [], events: [] }));
    localStorage.removeItem('gtm_pro_user');
  };

  const upsertCompany = async (c: Partial<Company>) => {
    if (!state.user) return { success: false, error: "Sem usuário" };
    const p = { user_id: state.user.id, name: c.name, status: c.status, target_ies: c.targetIES, contacts: c.contacts };
    if (c.id) await supabase.from('companies').update(p).eq('id', c.id).eq('user_id', state.user.id);
    else await supabase.from('companies').insert([p]);
    await fetchData(state.user);
    return { success: true };
  };

  const deleteCompany = async (id: string) => {
    if (!state.user) return;
    await supabase.from('companies').delete().eq('id', id).eq('user_id', state.user.id);
    await fetchData(state.user);
  };

  const upsertEvent = async (e: Partial<CommercialEvent>) => {
    if (!state.user) return;
    const p = { title: e.title, description: e.description, event_date: e.date, event_type: e.type, created_by: state.user.name };
    if (e.id) await supabase.from('commercial_events').update(p).eq('id', e.id);
    else await supabase.from('commercial_events').insert([p]);
    await fetchData(state.user);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('commercial_events').delete().eq('id', id);
    if (state.user) await fetchData(state.user);
  };

  const upsertInventory = async (i: Partial<InventoryItem>) => {
    const p = { name: i.name, category: i.category, quantity: i.quantity, min_quantity: i.minQuantity, last_update: new Date().toISOString() };
    if (i.id) await supabase.from('inventory').update(p).eq('id', i.id);
    else await supabase.from('inventory').insert([p]);
    if (state.user) await fetchData(state.user);
  };

  const deleteInventory = async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id);
    if (state.user) await fetchData(state.user);
  };

  const logAction = async (a: string, e: string, eid: string, d: string) => {
    if (!state.user) return;
    await supabase.from('audit_logs').insert([{ user_id: state.user.id, action: a, entity: e, entity_id: eid, details: d }]);
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
