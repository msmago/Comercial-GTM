
import { supabase } from '../../shared/lib/supabase';
import { GoogleSheet } from './sheets.types';

export const SheetsService = {
  async getSheets(userId: string): Promise<GoogleSheet[]> {
    const { data } = await supabase
      .from('google_sheets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return (data || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      title: s.title,
      url: s.url,
      category: s.category,
      description: s.description,
      createdAt: s.created_at
    }));
  },

  async upsertSheet(userId: string, sheet: Partial<GoogleSheet>) {
    const payload = {
      user_id: userId,
      title: sheet.title,
      url: sheet.url,
      category: sheet.category,
      description: sheet.description
    };
    if (sheet.id && sheet.id !== "") return supabase.from('google_sheets').update(payload).eq('id', sheet.id).eq('user_id', userId);
    return supabase.from('google_sheets').insert([payload]);
  },

  async deleteSheet(userId: string, id: string) {
    return supabase.from('google_sheets').delete().eq('id', id).eq('user_id', userId);
  }
};
