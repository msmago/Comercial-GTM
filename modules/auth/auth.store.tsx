
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

// Lista de administradores forçados via código (Emergency Access)
const SUPER_ADMINS = ['viniciuspatricio28@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const logout = useCallback(() => {
    setState({ user: null, loading: false, error: null });
    localStorage.removeItem('gtm_pro_user');
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const processUserData = (user: User): User => {
    // Override de role para emails específicos
    if (SUPER_ADMINS.includes(user.email.toLowerCase().trim())) {
      return { ...user, role: 'ADMIN' };
    }
    return user;
  };

  useEffect(() => {
    const initAuth = async () => {
      const saved = localStorage.getItem('gtm_pro_user');
      if (saved) {
        try {
          let userObj = JSON.parse(saved);
          const isValid = await AuthService.validateUser(userObj.id);
          if (isValid) {
            // Aplica override se necessário na restauração da sessão
            userObj = processUserData(userObj);
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
        // Aplica override de role no momento do login
        const finalUser = processUserData(data);
        setState({ user: finalUser, loading: false, error: null });
        localStorage.setItem('gtm_pro_user', JSON.stringify(finalUser));
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
        // Aplica override de role também no registro se o email constar na lista
        const finalUser = processUserData(data);
        setState({ user: finalUser, loading: false, error: null });
        localStorage.setItem('gtm_pro_user', JSON.stringify(finalUser));
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
