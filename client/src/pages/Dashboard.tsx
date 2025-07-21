import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, AlertCircle, Activity, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { ConsultasChart } from '../components/Dashboard/ConsultasChart';
import { EstoqueAlerts } from '../components/Dashboard/EstoqueAlerts';
import { FinanceiroChart } from '../components/Dashboard/FinanceiroChart';
import { useEffect, useState } from 'react';
import { apiClient, ConsultaResponse } from '../lib/api';
import { useLocation } from 'wouter';

export function Dashboard() {
  const [proximasConsultas, setProximasConsultas] = useState<ConsultaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  useEffect(() => {
    fetchProximasConsultas();
  }, []);

  const fetchProximasConsultas = async () => {
    try {
      const consultas = await apiClient.getConsultas();
      setProximasConsultas(consultas.slice(0, 5));
    } catch (error) {
      console.error('Error fetching consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADA':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'REALIZADA':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AGENDADA':
        return '📅';
      case 'CONFIRMADA':
        return '✅';
      case 'CANCELADA':
        return '❌';
      case 'REALIZADA':
        return '✔️';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao DoctorPlus. Visão geral da sua clínica em tempo real.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Atualizado em {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts and Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas Chart */}
        <div className="min-h-0">
          <ConsultasChart />
        </div>

        {/* Financeiro Chart */}
        <div className="min-h-0">
          <FinanceiroChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Consultas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Próximas Consultas
            </h3>
            <button
              onClick={() => navigate('/agenda')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver agenda →
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              ))
            ) : proximasConsultas.length > 0 ? (
              proximasConsultas.map((consulta) => (
                <div key={consulta.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => navigate('/agenda')}>
                  <div className={`w-3 h-3 rounded-full ${
                    consulta.status === 'AGENDADA' ? 'bg-yellow-400' :
                    consulta.status === 'CONFIRMADA' ? 'bg-green-400' :
                    'bg-red-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {consulta.paciente?.nome}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(consulta.status)}`}>
                        {getStatusIcon(consulta.status)} {consulta.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(consulta.dataHora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Dr. {consulta.profissional?.usuario.nome}
                      </div>
                    </div>
                    {consulta.valor && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        R$ {Number(consulta.valor).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nenhuma consulta agendada</p>
                <button
                  onClick={() => navigate('/agenda')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Agendar consulta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Estoque */}
        <div className="min-h-0">
          <EstoqueAlerts />
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Atividade Recente
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Sistema iniciado</h4>
              <p className="text-sm text-blue-700">
                Dashboard carregado com sucesso
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Estatísticas atualizadas</h4>
              <p className="text-sm text-green-700">
                Dados sincronizados com o banco de dados
              </p>
              <p className="text-xs text-green-600 mt-1">
                {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <h4 className="font-medium text-purple-900">Módulos carregados</h4>
              <p className="text-sm text-purple-700">
                Pacientes, Agenda, Prontuários, Estoque e Secretários
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Sistema totalmente operacional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}