import { Users, Calendar, FileText, Package, TrendingUp, AlertTriangle, DollarSign, Activity, UserCheck, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';

interface DashboardStats {
  totalPacientes: number;
  totalProfissionais: number;
  totalSecretarios: number;
  totalHistoricos: number;
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  consultasAgendadas: number;
  consultasConfirmadas: number;
  consultasRealizadas: number;
  itensEstoque: number;
  itensEstoqueBaixo: number;
  itensEsgotados: number;
  pacientesNovosHoje: number;
  pacientesNovosSemana: number;
  receitaMes: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    totalProfissionais: 0,
    totalSecretarios: 0,
    totalHistoricos: 0,
    consultasHoje: 0,
    consultasSemana: 0,
    consultasMes: 0,
    consultasAgendadas: 0,
    consultasConfirmadas: 0,
    consultasRealizadas: 0,
    itensEstoque: 0,
    itensEstoqueBaixo: 0,
    itensEsgotados: 0,
    pacientesNovosHoje: 0,
    pacientesNovosSemana: 0,
    receitaMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const statCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPacientes,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      growth: calculateGrowth(stats.pacientesNovosSemana, 5), // Mock previous week
      subtitle: `+${stats.pacientesNovosHoje} hoje`,
    },
    {
      title: 'Consultas Hoje',
      value: stats.consultasHoje,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      growth: calculateGrowth(stats.consultasHoje, 3), // Mock previous day
      subtitle: `${stats.consultasSemana} esta semana`,
    },
    {
      title: 'Prontuários',
      value: stats.totalHistoricos,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      growth: 15.2,
      subtitle: 'Registros médicos',
    },
    {
      title: 'Alertas de Estoque',
      value: stats.itensEstoqueBaixo + stats.itensEsgotados,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      growth: -8.5,
      subtitle: `${stats.itensEsgotados} esgotados`,
    },
    {
      title: 'Receita do Mês',
      value: formatCurrency(stats.receitaMes),
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      growth: 12.8,
      subtitle: 'Consultas realizadas',
      isFinancial: true,
    },
    {
      title: 'Consultas Agendadas',
      value: stats.consultasAgendadas,
      icon: Activity,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      growth: 5.3,
      subtitle: `${stats.consultasConfirmadas} confirmadas`,
    },
    {
      title: 'Profissionais',
      value: stats.totalProfissionais,
      icon: Stethoscope,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      growth: 0,
      subtitle: 'Ativos no sistema',
    },
    {
      title: 'Secretários',
      value: stats.totalSecretarios,
      icon: UserCheck,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      growth: 0,
      subtitle: 'Equipe administrativa',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="mt-4">
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stat.textColor} opacity-75`}>
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>
                {stat.isFinancial ? stat.value : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className={`text-xs ${stat.textColor} opacity-60 mt-1`}>
                {stat.subtitle}
              </p>
            </div>
            <div className={`${stat.color} rounded-lg p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className={`h-4 w-4 ${stat.growth >= 0 ? stat.textColor : 'text-red-500'} mr-1`} />
            <span className={`text-sm font-medium ${stat.growth >= 0 ? stat.textColor : 'text-red-500'}`}>
              {stat.growth >= 0 ? '+' : ''}{stat.growth.toFixed(1)}%
            </span>
            <span className={`text-sm ${stat.textColor} opacity-75 ml-1`}>
              vs. período anterior
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}