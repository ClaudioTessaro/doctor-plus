import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, UsuarioResponse, RegisterRequest } from '../lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UsuarioResponse | null;
  loading: boolean;
  signUp: (userData: RegisterRequest) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        apiClient.setToken(token);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  const signUp = async (userData: RegisterRequest) => {
    try {
      // Validar idade (maior de 18 anos)
      const birthDate = new Date(userData.dataNascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        throw new Error('Usuário deve ser maior de 18 anos');
      }

      const response = await apiClient.register(userData);
      toast.success('Cadastro realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      // Store token and user data
      apiClient.setToken(response.token);
      localStorage.setItem('userData', JSON.stringify(response.usuario));
      setUser(response.usuario);
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage
      apiClient.setToken(null);
      localStorage.removeItem('userData');
      setUser(null);
      
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}