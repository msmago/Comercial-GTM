
import { supabase } from '../../shared/lib/supabase';
import { CommercialEvent } from './calendar.types';

export const CalendarService = {
  async getEvents(): Promise<CommercialEvent[]> {
    const { data, error } = await supabase
      .from('commercial_events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar eventos:", error);
      return [];
    }

    return (data || []).map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.event_date,
      time: e.time,
      location: e.location,
      type: e.event_type,
      taskId: e.task_id,
      createdBy: e.created_by || 'Sistema'
    }));
  },

  async upsertEvent(event: Partial<CommercialEvent>, user: { id: string; name: string }) {
    const payload = {
      user_id: user.id,
      title: event.title || 'Sem título',
      description: event.description || '',
      event_date: event.date,
      time: event.time || null,
      location: event.location || '',
      event_type: event.type || 'MANUAL',
      created_by: user.name || 'Operador'
    };
    
    if (event.id) {
      return supabase.from('commercial_events').update(payload).eq('id', event.id);
    }
    return supabase.from('commercial_events').insert([payload]);
  },

  async deleteEvent(id: string) {
    return supabase.from('commercial_events').delete().eq('id', id);
  }
};
