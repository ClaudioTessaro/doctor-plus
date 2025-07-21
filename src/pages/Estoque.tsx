import { useState, useEffect } from 'react';
import { Plus, Search, Package, AlertTriangle, TrendingDown, Edit } from 'lucide-react';
import { supabase, EstoqueItem } from '../lib/supabase';
import toast from 'react-hot-toast';

export function Estoque() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEstoque();
  }, []);

  const fetchEstoque = async () => {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      setEstoque(data || []);
    } catch (error) {
      console.error('Error fetching estoque:', error);
      toast.error('Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  };

  const filteredEstoque = estoque.filter(item => {
    const matchSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = !filterCategoria || item.categoria === filterCategoria;
    return matchSearch && matchCategoria;
  });

  const categorias = [...new Set(estoque.map(item => item.categoria).filter(Boolean))];
  
  const itensEmAlerta = estoque.filter(item => item.quantidade <= item.min_alerta);
  
  const getStatusColor = (item: EstoqueItem) => {
    if (item.quantidade === 0) return 'text-red-600 bg-red-50';
    if (item.quantidade <= item.min_alerta) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (item: EstoqueItem) => {
    if (item.quantidade === 0) return 'Esgotado';
    if (item.quantidade <= item.min_alerta) return 'Baixo';
    return 'Disponível';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600 mt-2">Controle de medicamentos e produtos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Alertas de Estoque */}
      {itensEmAlerta.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Alertas de Estoque</h3>
          </div>
          <p className="text-yellow-700 text-sm">
            {itensEmAlerta.length} {itensEmAlerta.length === 1 ? 'item está' : 'itens estão'} com estoque baixo ou esgotado
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Produto</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Código</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Categoria</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantidade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Valor Unit.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEstoque.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.nome}</div>
                      {item.descricao && (
                        <div className="text-sm text-gray-500">{item.descricao}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 font-mono">{item.codigo}</td>
                  <td className="py-4 px-4">
                    {item.categoria && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {item.categoria}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {item.quantidade} {item.unidade}
                      </span>
                      {item.quantidade <= item.min_alerta && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {item.min_alerta} {item.unidade}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item)}`}>
                      {getStatusText(item)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {item.valor_unitario ? `R$ ${item.valor_unitario.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Ajustar estoque"
                      >
                        <Package className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEstoque.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterCategoria ? 'Nenhum item encontrado' : 'Nenhum item no estoque'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal seria implementado aqui */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Novo Item do Estoque</h3>
            <p className="text-gray-600 mb-4">
              Formulário de cadastro será implementado aqui
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}