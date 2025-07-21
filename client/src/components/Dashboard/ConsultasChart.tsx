import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface ConsultaStats {
  totalMes: number;
  agendadas: number;
  confirmadas: number;
  realizadas: number;
  canceladas: number;
  taxaRealizacao: number;
}

export function ConsultasChart() {
  const [stats, setStats] = useState<ConsultaStats>({
    totalMes: 0,
    agendadas: 0,
    confirmadas: 0,
    realizadas: 0,
    canceladas: 0,
    taxaRealizacao: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultaStats();
  }, []);

  const fetchConsultaStats = async () => {
    try {
      const data = await apiClient.getConsultaStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching consulta stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    {
      label: 'Agendadas',
      value: stats.agendadas,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      icon: Clock,
      percentage: stats.totalMes > 0 ? (stats.agendadas / stats.totalMes) * 100 : 0,
    },
    {
      label: 'Confirmadas',
      value: stats.confirmadas,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: CheckCircle,
      percentage: stats.totalMes > 0 ? (stats.confirmadas / stats.totalMes) * 100 : 0,
    },
    {
      label: 'Realizadas',
      value: stats.realizadas,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle,
      percentage: stats.totalMes > 0 ? (stats.realizadas / stats.totalMes) * 100 : 0,
    },
    {
      label: 'Canceladas',
      value: stats.canceladas,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      icon: XCircle,
      percentage: stats.totalMes > 0 ? (stats.canceladas / stats.totalMes) * 100 : 0,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-full"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Status das Consultas
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{stats.totalMes}</div>
          <div className="text-sm text-gray-500">Total no mês</div>
        </div>
      </div>

      <div className="space-y-4">
        {statusData.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg ${item.bgColor} border border-opacity-20 transition-all hover:shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`${item.color} rounded-lg p-2`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className={`font-medium ${item.textColor}`}>{item.label}</div>
                  <div className="text-sm text-gray-600">{item.percentage.toFixed(1)}% do total</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Taxa de realização */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Taxa de Realização</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {stats.taxaRealizacao.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Consultas realizadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}