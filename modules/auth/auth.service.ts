
import { supabase } from '../../shared/lib/supabase';
import { User } from './auth.types';

export const AuthService = {
  async login(email: string, password: string): Promise<{ data: User | null; error: any }> {
    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        return { data: null, error: { message: 'E-mail e senha são obrigatórios.' } };
      }

      // ilike faz a comparação insensível a maiúsculas/minúsculas para o e-mail
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (error) {
        console.error("DEBUG - Erro de Banco:", error);
        return { data: null, error: { message: `Erro de conexão: ${error.message}` } };
      }

      if (!data) {
        console.warn(`DEBUG - Falha de login para: ${cleanEmail}`);
        return { data: null, error: { message: 'Credenciais inválidas. Verifique seu e-mail e senha.' } };
      }
      
      return { 
        data: { id: data.id, name: data.name, email: data.email, role: data.role }, 
        error: null 
      };
    } catch (err: any) {
      console.error("DEBUG - Erro Crítico:", err);
      return { data: null, error: { message: 'Serviço de autenticação indisponível no momento.' } };
    }
  },

  async register(name: string, email: string, password: string): Promise<{ data: User | null; error: any }> {
    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          name: name.trim(), 
          email: cleanEmail, 
          password: password.trim(), 
          role: 'USER' 
        }])
        .select()
        .single();

      if (error) {
        console.error("DEBUG - Erro de Cadastro:", error);
        return { data: null, error: { message: error.message } };
      }
      
      return { 
        data: { id: data.id, name: data.name, email: data.email, role: data.role }, 
        error: null 
      };
    } catch (err: any) {
      return { data: null, error: { message: 'Falha ao processar registro.' } };
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
