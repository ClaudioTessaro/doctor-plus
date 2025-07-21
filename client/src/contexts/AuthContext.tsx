import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
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
  const [location, navigate] = useLocation();

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
      toast.loading('📝 Criando sua conta...', {
        id: 'signup-loading'
      });
      
      // Validar idade (maior de 18 anos)
      const birthDate = new Date(userData.dataNascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        toast.dismiss('signup-loading');
        throw new Error('Usuário deve ser maior de 18 anos');
      }

      const response = await apiClient.register(userData);
      
      toast.dismiss('signup-loading');
      toast.success(`🎉 Conta criada com sucesso! Bem-vindo(a), ${userData.nome}! Você já pode fazer login.`, {
        duration: 6000,
      });
    } catch (error: any) {
      toast.dismiss('signup-loading');
      
      console.error('Signup error details:', error);
      
      toast.error(`❌ Erro no Cadastro: ${error.message || 'Verifique os dados fornecidos e tente novamente.'}`);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const loadingToast = toast.loading('🔐 Verificando credenciais...');
      
      const response = await apiClient.login(email, password);
      
      console.log('Login response:', response);
      
      // Store token and user data first
      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem('userData', JSON.stringify(response.usuario));
        
        // Update user state
        setUser(response.usuario);
        
        toast.dismiss(loadingToast);
        toast.success(`🎉 Bem-vindo de volta, ${response.usuario.nome}! Redirecionando...`);
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error: any) {
      toast.dismiss(); // Remove qualquer toast ativo
      
      console.error('Login error details:', error);
      
      toast.error(`🔒 Falha na Autenticação: ${error.message || 'Verifique seu email e senha.'}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      toast.loading('👋 Fazendo logout...', {
        id: 'signout-loading'
      });
      
      // Clear local storage
      apiClient.setToken(null);
      localStorage.removeItem('userData');
      setUser(null);
      
      toast.dismiss('signout-loading');
      toast.success('👋 Até logo! Logout realizado com sucesso.', {
        duration: 4000,
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (error: any) {
      toast.dismiss('signout-loading');
      toast.error(`❌ Erro no Logout: ${error.message || 'Ocorreu um erro inesperado. Tente novamente.'}`, {
        duration: 6000,
      });
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