import { Route, Switch } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { Agenda } from './pages/Agenda';
import { Prontuarios } from './pages/Prontuarios';
import { Estoque } from './pages/Estoque';
import { Secretarios } from './pages/Secretarios';
import { Profissionais } from './pages/Profissionais';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Switch>
          <Route path="/login">
            <LoginForm />
          </Route>
          <Route path="/cadastro">
            <RegisterForm />
          </Route>
          
          <Route path="/dashboard">
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/pacientes">
            <ProtectedRoute>
              <Layout>
                <Pacientes />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/agenda">
            <ProtectedRoute>
              <Layout>
                <Agenda />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/prontuarios">
            <ProtectedRoute>
              <Layout>
                <Prontuarios />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/estoque">
            <ProtectedRoute>
              <Layout>
                <Estoque />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/secretarios">
            <ProtectedRoute requiredRole={['ADMIN', 'PROFISSIONAL']}>
              <Layout>
                <Secretarios />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/profissionais">
            <ProtectedRoute requiredRole={['ADMIN']}>
              <Layout>
                <Profissionais />
              </Layout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/">
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          </Route>
        </Switch>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'white',
              color: '#333',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '420px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            success: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                color: '#14532d',
                border: '1px solid #16a34a',
                borderLeft: '4px solid #16a34a',
                boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.15), 0 10px 10px -5px rgba(34, 197, 94, 0.08)',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f0fdf4',
              },
            },
            error: {
              duration: 8000,
              style: {
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                color: '#7f1d1d',
                border: '1px solid #dc2626',
                borderLeft: '4px solid #dc2626',
                boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 10px 10px -5px rgba(239, 68, 68, 0.08)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
            },
            loading: {
              duration: Infinity,
              style: {
                background: 'linear-gradient(135deg, #fefbf3 0%, #fef3c7 100%)',
                color: '#78350f',
                border: '1px solid #d97706',
                borderLeft: '4px solid #d97706',
                boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 10px 10px -5px rgba(245, 158, 11, 0.08)',
              },
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#fefbf3',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;