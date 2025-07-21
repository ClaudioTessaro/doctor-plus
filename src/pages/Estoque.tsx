import { useState, useEffect } from 'react';
import { Plus, Search, Package, AlertTriangle, TrendingDown, Edit, Calculator, Eye, Trash2, Loader2 } from 'lucide-react';
import { apiClient, EstoqueResponse } from '../lib/api';
import { EstoqueModal } from '../components/Estoque/EstoqueModal';
import { AjusteQuantidadeModal } from '../components/Estoque/AjusteQuantidadeModal';
import { ConfirmDialog } from '../components/Pacientes/ConfirmDialog';
import toast from 'react-hot-toast';

interface EstoqueFormData {
  nome: string;
  descricao?: string;
  codigo: string;
  quantidade: number;
  unidade: string;
  valorUnitario?: number;
  minAlerta: number;
  categoria?: string;
}

export function Estoque() {
  const [estoque, setEstoque] = useState<EstoqueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EstoqueResponse | null>(null);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [itemParaAjuste, setItemParaAjuste] = useState<EstoqueResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EstoqueResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEstoque();
  }, []);

  const fetchEstoque = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEstoque();
      setEstoque(data);
    } catch (error: any) {
      console.error('Error fetching estoque:', error);
      toast.error('📦 Erro ao carregar estoque', {
        description: error.message || 'Não foi possível carregar os itens do estoque.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (data: EstoqueFormData) => {
    try {
      const newItem = await apiClient.createEstoqueItem(data);
      setEstoque(prev => [newItem, ...prev]);
      
      toast.success('📦 Item cadastrado com sucesso!', {
        description: `${data.nome} foi adicionado ao estoque com ${data.quantidade} ${data.unidade}.`,
      });
    } catch (error: any) {
      console.error('Error creating item:', error);
      
      let errorMessage = 'Não foi possível cadastrar o item.';
      if (error.message.includes('Código já está em uso')) {
        errorMessage = 'Este código já está cadastrado no sistema.';
      }
      
      toast.error('❌ Erro no cadastro', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleUpdateItem = async (data: EstoqueFormData) => {
    if (!editingItem) return;

    try {
      const updatedItem = await apiClient.updateEstoqueItem(editingItem.id, data);
      setEstoque(prev => 
        prev.map(item => item.id === editingItem.id ? updatedItem : item)
      );
      
      toast.success('✅ Item atualizado com sucesso!', {
        description: `Dados de ${data.nome} foram atualizados.`,
      });
    } catch (error: any) {
      console.error('Error updating item:', error);
      
      let errorMessage = 'Não foi possível atualizar o item.';
      if (error.message.includes('Código já está em uso')) {
        errorMessage = 'Este código já está cadastrado para outro item.';
      }
      
      toast.error('❌ Erro na atualização', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleAjusteQuantidade = async (
    tipo: 'adicionar' | 'remover' | 'ajustar', 
    quantidade: number, 
    motivo?: string
  ) => {
    if (!itemParaAjuste) return;

    try {
      let updatedItem: EstoqueResponse;
      
      switch (tipo) {
        case 'adicionar':
          updatedItem = await apiClient.adicionarQuantidadeEstoque(itemParaAjuste.id, quantidade);
          break;
        case 'remover':
          updatedItem = await apiClient.removerQuantidadeEstoque(itemParaAjuste.id, quantidade);
          break;
        case 'ajustar':
          updatedItem = await apiClient.ajustarQuantidadeEstoque(itemParaAjuste.id, quantidade);
          break;
        default:
          throw new Error('Tipo de operação inválido');
      }

      setEstoque(prev => 
        prev.map(item => item.id === itemParaAjuste.id ? updatedItem : item)
      );

      const operacaoTexto = {
        adicionar: 'adicionadas',
        remover: 'removidas',
        ajustar: 'ajustada para'
      }[tipo];

      toast.success('📊 Quantidade atualizada!', {
        description: `${quantidade} ${itemParaAjuste.unidade} ${operacaoTexto} ${tipo === 'ajustar' ? '' : 'ao'} estoque de ${itemParaAjuste.nome}.`,
      });
    } catch (error: any) {
      console.error('Error adjusting quantity:', error);
      
      let errorMessage = 'Não foi possível ajustar a quantidade.';
      if (error.message.includes('Quantidade insuficiente')) {
        errorMessage = 'Quantidade insuficiente em estoque para esta operação.';
      }
      
      toast.error('❌ Erro no ajuste', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      await apiClient.desativarEstoqueItem(itemToDelete.id);
      
      setEstoque(prev => prev.filter(item => item.id !== itemToDelete.id));
      
      toast.success('✅ Item removido com sucesso!', {
        description: `${itemToDelete.nome} foi removido do estoque.`,
      });
      
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error('❌ Erro ao remover item', {
        description: error.message || 'Não foi possível remover o item.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (item?: EstoqueResponse) => {
    setEditingItem(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const openAjusteModal = (item: EstoqueResponse) => {
    setItemParaAjuste(item);
    setShowAjusteModal(true);
  };

  const closeAjusteModal = () => {
    setShowAjusteModal(false);
    setItemParaAjuste(null);
  };

  const openDeleteDialog = (item: EstoqueResponse) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const filteredEstoque = estoque.filter(item => {
    const matchSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (item.categoria && item.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategoria = !filterCategoria || item.categoria === filterCategoria;
    
    const matchStatus = !filterStatus || 
      (filterStatus === 'baixo' && item.estoqueBaixo) ||
      (filterStatus === 'esgotado' && item.esgotado) ||
      (filterStatus === 'disponivel' && !item.estoqueBaixo && !item.esgotado);
    
    return matchSearch && matchCategoria && matchStatus;
  });

  const categorias = [...new Set(estoque.map(item => item.categoria).filter(Boolean))];
  const itensEmAlerta = estoque.filter(item => item.estoqueBaixo || item.esgotado);
  
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600 mt-2">
            Controle de medicamentos e produtos ({estoque.length} itens)
          </p>
        </div>
        <button
          onClick={() => openModal()}
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
        {/* Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="esgotado">Esgotado</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
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
              {filteredEstoque.map((item) => {
                const status = getStatusText(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.nome}</div>
                        {item.descricao && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.descricao}
                          </div>
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
                        {item.estoqueBaixo && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minAlerta} {item.unidade}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(item)}`}>
                        <span>{status.icon}</span>
                        <span>{status.text}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {item.valorUnitario ? `R$ ${Number(item.valorUnitario).toFixed(2)}` : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar item"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openAjusteModal(item)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Ajustar quantidade"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEstoque.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm || filterCategoria || filterStatus ? 'Nenhum item encontrado' : 'Nenhum item no estoque'}
              </p>
              {searchTerm || filterCategoria || filterStatus ? (
                <p className="text-gray-400 text-sm">
                  Tente ajustar os filtros de busca
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  Clique em "Novo Item" para começar
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <EstoqueModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
        item={editingItem}
      />

      {/* Modal de Ajuste de Quantidade */}
      {itemParaAjuste && (
        <AjusteQuantidadeModal
          isOpen={showAjusteModal}
          onClose={closeAjusteModal}
          onSave={handleAjusteQuantidade}
          item={itemParaAjuste}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteItem}
        title="Remover Item do Estoque"
        message={`Tem certeza que deseja remover "${itemToDelete?.nome}" do estoque? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}