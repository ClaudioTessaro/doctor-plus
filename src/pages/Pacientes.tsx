import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, Eye, Loader2 } from 'lucide-react';
import { apiClient, PacienteResponse, PageResponse, ConsultaResponse, HistoricoResponse } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { PacienteModal } from '../components/Pacientes/PacienteModal';
import { PacienteDetailsModal } from '../components/Pacientes/PacienteDetailsModal';
import { ConfirmDialog } from '../components/Pacientes/ConfirmDialog';
import { Pagination } from '../components/Common/Pagination';

interface PacienteFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  dataNascimento: string;
}

export function Pacientes() {
  const [pacientesPage, setPacientesPage] = useState<PageResponse<PacienteResponse>>({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<PacienteResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState<PacienteResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Modal de visualização
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteResponse | null>(null);
  const [pacienteConsultas, setPacienteConsultas] = useState<ConsultaResponse[]>([]);
  const [pacienteHistoricos, setPacienteHistoricos] = useState<HistoricoResponse[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, [currentPage, pageSize]);

  useEffect(() => {
    // Reset page when search term changes
    setCurrentPage(0);
    fetchPacientes();
  }, [searchTerm]);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      let data;
      if (searchTerm.trim()) {
        data = await apiClient.searchPacientesPaginated(searchTerm, currentPage, pageSize);
      } else {
        data = await apiClient.getPacientes(currentPage, pageSize);
      }
      setPacientesPage(data);
    } catch (error: any) {
      console.error('Error fetching pacientes:', error);
      
      const errorTitle = (error as any).title || 'Erro ao Carregar Dados';
      
      toast.error(`❌ ${errorTitle}`, {
        description: `${error.message || 'Não foi possível carregar a lista de pacientes.'}`,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaciente = async (data: PacienteFormData) => {
    try {
      toast.loading('👤 Cadastrando paciente...', {
        id: 'create-patient-loading'
      });
      
      const newPaciente = await apiClient.createPaciente(data);
      // Refresh current page
      fetchPacientes();
      
      toast.dismiss('create-patient-loading');
      toast.success('🎉 Paciente cadastrado com sucesso!', {
        description: `${data.nome} foi adicionado ao sistema com CPF ${data.cpf}.`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error creating paciente:', error);
      
      toast.dismiss('create-patient-loading');
      
      const errorTitle = (error as any).title || 'Erro no Cadastro';
      const errorDescription = (error as any).description || 'Verifique os dados fornecidos.';
      
      toast.error(`❌ ${errorTitle}`, {
        description: `${error.message}${errorDescription ? '\n' + errorDescription : ''}`,
        duration: 8000,
      });
      throw error;
    }
  };

  const handleUpdatePaciente = async (data: PacienteFormData) => {
    if (!editingPaciente) return;

    try {
      toast.loading('✏️ Atualizando dados...', {
        id: 'update-patient-loading'
      });
      
      const updatedPaciente = await apiClient.updatePaciente(editingPaciente.id, data);
      // Refresh current page
      fetchPacientes();
      
      toast.dismiss('update-patient-loading');
      toast.success('✅ Dados atualizados com sucesso!', {
        description: `As informações de ${data.nome} foram atualizadas no sistema.`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error updating paciente:', error);
      
      toast.dismiss('update-patient-loading');
      
      const errorTitle = (error as any).title || 'Erro na Atualização';
      const errorDescription = (error as any).description || 'Verifique os dados fornecidos.';
      
      toast.error(`❌ ${errorTitle}`, {
        description: `${error.message}${errorDescription ? '\n' + errorDescription : ''}`,
        duration: 8000,
      });
      throw error;
    }
  };

  const handleDeletePaciente = async () => {
    if (!pacienteToDelete) return;

    try {
      setDeleting(true);
      toast.loading('🗑️ Removendo paciente...', {
        id: 'delete-patient-loading'
      });
      
      await apiClient.deletePaciente(pacienteToDelete.id);
      // Refresh current page
      fetchPacientes();
      
      toast.dismiss('delete-patient-loading');
      toast.success('✅ Paciente removido com sucesso!', {
        description: `${pacienteToDelete.nome} foi removido do sistema permanentemente.`,
        duration: 5000,
      });
      
      setShowDeleteDialog(false);
      setPacienteToDelete(null);
    } catch (error: any) {
      console.error('Error deleting paciente:', error);
      
      toast.dismiss('delete-patient-loading');
      
      const errorTitle = (error as any).title || 'Erro ao Remover';
      const errorDescription = (error as any).description || 'O paciente pode ter consultas ou históricos vinculados.';
      
      toast.error(`❌ ${errorTitle}`, {
        description: `${error.message}${errorDescription ? '\n' + errorDescription : ''}`,
        duration: 8000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (paciente?: PacienteResponse) => {
    setEditingPaciente(paciente || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPaciente(null);
  };

  const openDeleteDialog = (paciente: PacienteResponse) => {
    setPacienteToDelete(paciente);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setPacienteToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const openDetailsModal = async (paciente: PacienteResponse) => {
    setSelectedPaciente(paciente);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      const [consultasData, historicosData] = await Promise.all([
        apiClient.getConsultasByPaciente(paciente.id),
        apiClient.getHistoricosByPaciente(paciente.id),
      ]);
      
      setPacienteConsultas(consultasData);
      setPacienteHistoricos(historicosData);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      
      const errorTitle = (error as any).title || 'Erro ao Carregar Detalhes';
      
      toast.error(`❌ ${errorTitle}`, {
        description: `${(error as any).message || 'Não foi possível carregar os detalhes do paciente.'}`,
        duration: 6000,
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPaciente(null);
    setPacienteConsultas([]);
    setPacienteHistoricos([]);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-2">
            Gerencie o cadastro de pacientes ({pacientesPage.totalElements} cadastrados)
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Paciente</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">CPF</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Idade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Contato</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Cadastro</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pacientesPage.content.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{paciente.nome}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {paciente.endereco}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 font-mono">
                    {formatCPF(paciente.cpf)}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {paciente.idade} anos
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatPhone(paciente.telefone)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{paciente.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {format(new Date(paciente.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal(paciente)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar paciente"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDetailsModal(paciente)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Ver prontuário"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(paciente)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir paciente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pacientesPage.content.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </p>
              {searchTerm ? (
                <p className="text-gray-400 text-sm">
                  Tente buscar por nome, CPF, e-mail ou telefone
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  Clique em "Novo Paciente" para começar
                </p>
              )}
            </div>
          )}
        </div>

        {/* Paginação */}
        {pacientesPage.totalElements > 0 && (
          <Pagination
            currentPage={pacientesPage.page}
            totalPages={pacientesPage.totalPages}
            totalElements={pacientesPage.totalElements}
            pageSize={pacientesPage.size}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <PacienteModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={editingPaciente ? handleUpdatePaciente : handleCreatePaciente}
        paciente={editingPaciente}
      />

      {/* Modal de Detalhes */}
      {selectedPaciente && (
        <PacienteDetailsModal
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
          paciente={selectedPaciente}
          consultas={pacienteConsultas}
          historicos={pacienteHistoricos}
          onEdit={() => {
            closeDetailsModal();
            openModal(selectedPaciente);
          }}
          loading={loadingDetails}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDeletePaciente}
        title="Excluir Paciente"
        message={`Tem certeza que deseja excluir o paciente "${pacienteToDelete?.nome}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}