
import { supabase } from '../../shared/lib/supabase';
import { Company, PipelineStatus } from './crm.types';

export const CRMService = {
  async getCompanies(userId: string): Promise<Company[]> {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return (data || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      status: (c.status?.toUpperCase() || PipelineStatus.PROSPECT) as PipelineStatus,
      targetIES: c.target_ies || '',
      contacts: c.contacts || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
  },

  async upsertCompany(userId: string, company: Partial<Company>) {
    const payload = {
      user_id: userId,
      name: company.name,
      status: company.status,
      target_ies: company.targetIES,
      contacts: company.contacts
    };
    if (company.id) return supabase.from('companies').update(payload).eq('id', company.id).eq('user_id', userId);
    return supabase.from('companies').insert([payload]);
  },

  async deleteCompany(userId: string, id: string) {
    return supabase.from('companies').delete().eq('id', id).eq('user_id', userId);
  }
};
