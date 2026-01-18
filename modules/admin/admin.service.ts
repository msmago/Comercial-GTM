
import { supabase } from '../../shared/lib/supabase';
import { ConsultantPerformance, AdminStats } from './admin.types';

export const AdminService = {
  async getGlobalStats(): Promise<AdminStats> {
    const [tasks, users, companies, inventory] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('inventory').select('*')
    ]);

    return {
      totalTasks: tasks.count || 0,
      activeConsultants: users.count || 0,
      totalCompanies: companies.count || 0,
      criticalInventoryItems: (inventory.data || []).filter((i: any) => i.quantity < i.min_quantity).length
    };
  },

  async getConsultantsPerformance(): Promise<ConsultantPerformance[]> {
    const { data: users } = await supabase.from('users').select('*');
    const { data: tasks } = await supabase.from('tasks').select('user_id, created_at');

    return (users || []).map(u => {
      const userTasks = (tasks || []).filter(t => t.user_id === u.id);
      const lastTask = userTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        taskCount: userTasks.length,
        lastActionAt: lastTask?.created_at || u.created_at,
        status: userTasks.length > 0 ? 'ACTIVE' : 'INACTIVE'
      };
    });
  },

  async getRecentTasks(limit = 10) {
    const { data } = await supabase
      .from('tasks')
      .select('*, users(name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }
};
