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
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
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