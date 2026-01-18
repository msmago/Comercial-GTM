
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState } from './auth.types';
import { AuthService } from './auth.service';

interface AuthContextType extends AuthState {
  login: (e: string, p: string) => Promise<boolean>;
  register: (n: string, e: string, p: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const logout = useCallback(() => {
    setState({ user: null, loading: false, error: null });
    localStorage.removeItem('gtm_pro_user');
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const saved = localStorage.getItem('gtm_pro_user');
      if (saved) {
        try {
          const userObj = JSON.parse(saved);
          const isValid = await AuthService.validateUser(userObj.id);
          if (isValid) {
            setState({ user: userObj, loading: false, error: null });
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    initAuth();
  }, [logout]);

  const login = async (email: string, pass: string) => {
    setState(p => ({ ...p, loading: true, error: null }));
    try {
      const { data, error } = await AuthService.login(email, pass);
      if (data) {
        setState({ user: data, loading: false, error: null });
        localStorage.setItem('gtm_pro_user', JSON.stringify(data));
        return true;
      }
      setState({ user: null, loading: false, error: error?.message || 'Falha na autenticação.' });
      return false;
    } catch (err: any) {
      setState({ user: null, loading: false, error: 'Erro de conexão com o servidor.' });
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setState(p => ({ ...p, loading: true, error: null }));
    try {
      const { data, error } = await AuthService.register(name, email, pass);
      if (data) {
        setState({ user: data, loading: false, error: null });
        localStorage.setItem('gtm_pro_user', JSON.stringify(data));
        return true;
      }
      setState({ user: null, loading: false, error: error?.message || 'Falha ao registrar.' });
      return false;
    } catch (err: any) {
      setState({ user: null, loading: false, error: 'Erro ao processar registro.' });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
