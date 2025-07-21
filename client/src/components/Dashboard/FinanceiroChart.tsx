import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface FinanceiroStats {
  receitaMes: number;
  receitaHoje: number;
  crescimentoMensal: number;
  ticketMedio: number;
}

export function FinanceiroChart() {
  const [stats, setStats] = useState<FinanceiroStats>({
    receitaMes: 0,
    receitaHoje: 0,
    crescimentoMensal: 0,
    ticketMedio: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceiroStats();
  }, []);

  const fetchFinanceiroStats = async () => {
    try {
      const data = await apiClient.getFinanceiroStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching financeiro stats:', error);
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

  const financialCards = [
    {
      title: 'Receita do Mês',
      value: formatCurrency(stats.receitaMes),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      growth: stats.crescimentoMensal,
      subtitle: 'Consultas realizadas',
    },
    {
      title: 'Receita Hoje',
      value: formatCurrency(stats.receitaHoje),
      icon: CreditCard,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      growth: 8.2, // Mock growth
      subtitle: 'Faturamento diário',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(stats.ticketMedio),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      growth: 5.7, // Mock growth
      subtitle: 'Por consulta',
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-500" />
          Resumo Financeiro
        </h3>
        <div className="flex items-center space-x-2">
          {stats.crescimentoMensal >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            stats.crescimentoMensal >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {stats.crescimentoMensal >= 0 ? '+' : ''}{stats.crescimentoMensal.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {financialCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-lg p-4 border border-opacity-20`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} rounded-lg p-2`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {card.growth >= 0 ? (
                  <TrendingUp className={`h-4 w-4 ${card.textColor}`} />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  card.growth >= 0 ? card.textColor : 'text-red-600'
                }`}>
                  {card.growth >= 0 ? '+' : ''}{card.growth.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div>
              <div className={`text-sm font-medium ${card.textColor} opacity-75 mb-1`}>
                {card.title}
              </div>
              <div className={`text-2xl font-bold ${card.textColor} mb-1`}>
                {card.value}
              </div>
              <div className={`text-xs ${card.textColor} opacity-60`}>
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de crescimento mensal */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Crescimento Mensal</h4>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            stats.crescimentoMensal >= 0 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {stats.crescimentoMensal >= 0 ? '+' : ''}{stats.crescimentoMensal.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              stats.crescimentoMensal >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(stats.crescimentoMensal), 100)}%` 
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Mês anterior</span>
          <span>Mês atual</span>
        </div>
      </div>
    </div>
  );
}