
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
