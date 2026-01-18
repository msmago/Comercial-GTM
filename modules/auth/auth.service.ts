
import { supabase } from '../../shared/lib/supabase';
import { User } from './auth.types';

export const AuthService = {
  async login(email: string, password: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) return { data: null, error: error || 'Invalido' };
    
    return { 
      data: { id: data.id, name: data.name, email: data.email, role: data.role }, 
      error: null 
    };
  },

  async register(name: string, email: string, password: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password, role: 'USER' }])
      .select()
      .single();

    if (error) return { data: null, error };
    return { 
      data: { id: data.id, name: data.name, email: data.email, role: data.role }, 
      error: null 
    };
  },

  async validateUser(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();
      
      return !!data && !error;
    } catch {
      return false;
    }
  }
};
