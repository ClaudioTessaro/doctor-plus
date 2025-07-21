import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Eye } from 'lucide-react';
import { apiClient, EstoqueResponse } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export function EstoqueAlerts() {
  const [itensAlerta, setItensAlerta] = useState<EstoqueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItensAlerta();
  }, []);

  const fetchItensAlerta = async () => {
    try {
      const data = await apiClient.getEstoqueBaixo();
      setItensAlerta(data.slice(0, 5)); // Mostrar apenas os 5 primeiros
    } catch (error) {
      console.error('Error fetching estoque alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (item: EstoqueResponse) => {
    if (item.esgotado) return 'text-red-600 bg-red-50 border-red-200';
    if (item.estoqueBaixo) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = (item: EstoqueResponse) => {
    if (item.esgotado) return { text: 'Esgotado', icon: '🔴' };
    if (item.estoqueBaixo) return { text: 'Baixo', icon: '🟡' };
    return { text: 'Disponível', icon: '🟢' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
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
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Alertas de Estoque
        </h3>
        <button
          onClick={() => navigate('/estoque')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
        >
          <Eye className="h-4 w-4" />
          <span>Ver todos</span>
        </button>
      </div>

      <div className="space-y-4">
        {itensAlerta.length > 0 ? (
          itensAlerta.map((item) => {
            const status = getStatusText(item);
            return (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  {item.esgotado ? (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  ) : (
                    <Package className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">{item.nome}</h4>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(item)}`}>
                      <span>{status.icon}</span>
                      <span>{status.text}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600">Código: {item.codigo}</p>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantidade} {item.unidade}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minAlerta} {item.unidade}
                      </div>
                    </div>
                  </div>
                  {item.categoria && (
                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {item.categoria}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <p className="text-green-600 font-medium">Estoque em dia!</p>
            <p className="text-green-500 text-sm">Nenhum item com estoque baixo</p>
          </div>
        )}
      </div>

      {itensAlerta.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {itensAlerta.length} {itensAlerta.length === 1 ? 'item precisa' : 'itens precisam'} de atenção
            </span>
            <button
              onClick={() => navigate('/estoque')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Gerenciar estoque →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}