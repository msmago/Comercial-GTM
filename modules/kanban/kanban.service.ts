
import { supabase } from '../../shared/lib/supabase';
import { Task, KanbanColumn, TaskPriority } from './kanban.types';

const DEFAULT_COLUMNS = [
  { title: 'Prospecção', color: 'bg-slate-900', order: 0 },
  { title: 'A Fazer', color: 'bg-blue-600', order: 1 },
  { title: 'Em Execução', color: 'bg-amber-500', order: 2 },
  { title: 'Concluído', color: 'bg-emerald-600', order: 3 },
];

export const KanbanService = {
  async getColumns(userId: string): Promise<KanbanColumn[]> {
    try {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      if (error) {
        const msg = error.message || JSON.stringify(error);
        if (msg.includes('relation') || msg.includes('row-level security') || error.code === '42P01') {
          return DEFAULT_COLUMNS.map((c, i) => ({
            id: `local-col-${i}`,
            userId: userId,
            title: c.title,
            color: c.color,
            order: c.order
          }));
        }
        return [];
      }

      // Se não houver colunas, tenta semear.
      if (!data || data.length === 0) {
        const seed = DEFAULT_COLUMNS.map(c => ({ 
          user_id: userId,
          title: c.title,
          color: c.color,
          order: c.order
        }));

        // Usamos insert mas lidamos com possíveis erros de conflito 409 se outra requisição já tiver semeado.
        const { data: seededData, error: seedError } = await supabase
          .from('kanban_columns')
          .insert(seed)
          .select();
        
        if (seedError) {
          const msg = seedError.message || JSON.stringify(seedError);
          
          // Se for conflito (409) ou duplicata, tentamos ler novamente as colunas que acabaram de ser criadas.
          if (seedError.code === '409' || seedError.code === '23505') {
             const { data: retryData } = await supabase
              .from('kanban_columns')
              .select('*')
              .eq('user_id', userId)
              .order('order', { ascending: true });
             if (retryData && retryData.length > 0) {
                return retryData.map(c => ({
                  id: c.id, userId: c.user_id, title: c.title, color: c.color, order: c.order
                }));
             }
          }

          if (seedError.code === '23503' || msg.includes('foreign key constraint')) {
            return DEFAULT_COLUMNS.map((c, i) => ({
              id: `temp-col-${i}`,
              userId: userId,
              title: c.title,
              color: c.color,
              order: c.order
            }));
          }
          return DEFAULT_COLUMNS.map((c, i) => ({
            id: `err-col-${i}`,
            userId: userId,
            title: c.title,
            color: c.color,
            order: c.order
          }));
        }
        
        return (seededData || []).map(c => ({
          id: c.id, userId: c.user_id, title: c.title, color: c.color, order: c.order
        }));
      }

      return data.map(c => ({
        id: c.id, userId: c.user_id, title: c.title, color: c.color, order: c.order
      }));
    } catch (err: any) {
      return DEFAULT_COLUMNS.map((c, i) => ({
        id: `critical-col-${i}`,
        userId: userId,
        title: c.title,
        color: c.color,
        order: c.order
      }));
    }
  },

  async getTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return [];

      return (data || []).map(t => ({
        id: t.id, 
        userId: t.user_id, 
        title: t.title || 'Sem Título', 
        description: t.description || '',
        status: t.status, 
        priority: (t.priority?.toUpperCase() || TaskPriority.MEDIUM) as TaskPriority, 
        date: t.due_date, 
        createdAt: t.created_at
      }));
    } catch (err: any) {
      return [];
    }
  },

  async upsertTask(userId: string, task: Partial<Task>) {
    const payload: any = {
      user_id: userId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.date
    };
    
    try {
      if (task.id) {
        const { error } = await supabase.from('tasks').update(payload).eq('id', task.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
        if (error) throw error;
        
        if (task.date && data?.id) {
          await supabase.from('commercial_events').insert([{ 
            title: `Ticket: ${task.title}`, 
            description: task.description, 
            event_date: task.date, 
            event_type: 'AUTO_TASK', 
            task_id: data.id,
            user_id: userId
          }]).catch(() => {});
        }
      }
    } catch (err: any) {
      throw new Error(err.message || JSON.stringify(err));
    }
  },

  async deleteTask(userId: string, id: string) {
    try {
      await supabase.from('commercial_events').delete().eq('task_id', id);
      const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return true;
    } catch (err: any) {
      throw new Error(err.message || JSON.stringify(err));
    }
  },

  async upsertColumn(userId: string, col: Partial<KanbanColumn>) {
    const payload = {
      user_id: userId,
      title: col.title,
      color: col.color,
      order: col.order || 0
    };
    try {
      const isLocal = col.id && (col.id.startsWith('local-') || col.id.startsWith('temp-') || col.id.startsWith('err-') || col.id.startsWith('critical-'));
      if (col.id && !isLocal) {
        const { error } = await supabase.from('kanban_columns').update(payload).eq('id', col.id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('kanban_columns').insert([payload]);
        if (error) throw error;
      }
    } catch (err: any) {
      throw new Error(err.message || JSON.stringify(err));
    }
  },

  async deleteColumn(userId: string, id: string) {
    const isLocal = id.startsWith('local-') || id.startsWith('temp-') || id.startsWith('err-') || id.startsWith('critical-');
    if (isLocal) return;
    try {
      const { error } = await supabase.from('kanban_columns').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
    } catch (err: any) {
      throw new Error(err.message || JSON.stringify(err));
    }
  }
};
