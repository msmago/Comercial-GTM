
import { supabase } from '../../shared/lib/supabase';
import { Task, KanbanColumn, TaskPriority } from './kanban.types';

export const KanbanService = {
  async getColumns(userId: string): Promise<KanbanColumn[]> {
    try {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      if (error) throw error;

      return (data || []).map(c => ({
        id: c.id, userId: c.user_id, title: c.title, color: c.color, order: c.order
      }));
    } catch (err) {
      console.error("Kanban Columns Error:", err);
      return [];
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
        title: t.title || 'Tarefa', 
        description: t.description || '',
        status: t.status, 
        priority: (t.priority || TaskPriority.MEDIUM) as TaskPriority, 
        date: t.due_date, 
        createdAt: t.created_at
      }));
    } catch (err) {
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
        await supabase.from('tasks').update(payload).eq('id', task.id).eq('user_id', userId);
      } else {
        await supabase.from('tasks').insert([payload]);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteTask(userId: string, id: string) {
    try {
      await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
      return true;
    } catch (err) {
      return false;
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
      if (col.id) {
        await supabase.from('kanban_columns').update(payload).eq('id', col.id).eq('user_id', userId);
      } else {
        await supabase.from('kanban_columns').insert([payload]);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteColumn(userId: string, id: string) {
    try {
      await supabase.from('kanban_columns').delete().eq('id', id).eq('user_id', userId);
    } catch (err) {}
  }
};
