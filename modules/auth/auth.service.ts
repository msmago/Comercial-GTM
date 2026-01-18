
import { supabase } from '../../shared/lib/supabase';
import { User } from './auth.types';

export const AuthService = {
  async login(email: string, password: string): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error) {
        console.error("Supabase Login Error:", error);
        return { data: null, error };
      }

      if (!data) {
        return { data: null, error: { message: 'Credenciais inválidas ou usuário não encontrado.' } };
      }
      
      return { 
        data: { id: data.id, name: data.name, email: data.email, role: data.role }, 
        error: null 
      };
    } catch (err: any) {
      console.error("Critical Auth Error:", err);
      return { data: null, error: err };
    }
  },

  async register(name: string, email: string, password: string): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email, password, role: 'USER' }])
        .select()
        .single();

      if (error) throw error;
      return { 
        data: { id: data.id, name: data.name, email: data.email, role: data.role }, 
        error: null 
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async validateUser(id: string): Promise<boolean> {
    if (!id) return false;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      return !!data && !error;
    } catch {
      return false;
    }
  }
};
