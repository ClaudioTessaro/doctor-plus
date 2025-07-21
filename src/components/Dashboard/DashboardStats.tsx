import { Users, Calendar, FileText, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';

interface Stats {
  totalPacientes: number;
  consultasHoje: number;
  prontuarios: number;
  estoqueAlerta: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalPacientes: 0,
    consultasHoje: 0,
    prontuarios: 0,
    estoqueAlerta: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar dados das APIs
      const [pacientes, consultasHoje, historicos, estoqueAlerta] = await Promise.all([
        apiClient.getPacientes(),
        apiClient.getConsultas(),
        apiClient.getHistoricos(),
        apiClient.getEstoqueBaixo(),
      ]);

      setStats({
        totalPacientes: pacientes.length,
        consultasHoje: consultasHoje.filter(c => {
          const today = new Date().toDateString();
          const consultaDate = new Date(c.dataHora).toDateString();
          return consultaDate === today;
        }).length,
        prontuarios: historicos.length,
        estoqueAlerta: estoqueAlerta.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPacientes,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Consultas Hoje',
      value: stats.consultasHoje,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Prontuários',
      value: stats.prontuarios,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Alertas de Estoque',
      value: stats.estoqueAlerta,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${stat.textColor} opacity-75`}>
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} rounded-lg p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className={`h-4 w-4 ${stat.textColor} mr-1`} />
            <span className={`text-sm ${stat.textColor} opacity-75`}>
              {index % 2 === 0 ? '+12%' : '+8%'} vs. mês anterior
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}