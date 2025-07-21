import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/cadastro" element={<RegisterForm />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="prontuarios" element={<Prontuarios />} />
              <Route path="estoque" element={<Estoque />} />
              <Route path="secretarios" element={
                <ProtectedRoute requiredRole={['ADMIN', 'PROFISSIONAL']}>
                  <Secretarios />
                </ProtectedRoute>
              } />
              <Route path="profissionais" element={
                <ProtectedRoute requiredRole={['ADMIN']}>
                  <Profissionais />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              className: 'toast-custom',
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '400px',
              },
              success: {
                duration: 4000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                duration: 6000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                style: {
                  background: '#fefbf3',
                  color: '#92400e',
                  border: '1px solid #fed7aa',
                  boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)',
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
    </Router>
  );
}

export default App;