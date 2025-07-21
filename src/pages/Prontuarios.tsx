import { useState, useEffect } from 'react';
import { FileText, Search, Plus, Eye, Edit, Trash2, Calendar, User, Stethoscope, Pill, Loader2 } from 'lucide-react';
import { apiClient, HistoricoResponse, PacienteResponse, PageResponse } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { ProntuarioModal } from '../components/Prontuarios/ProntuarioModal';
import { ConfirmDialog } from '../components/Pacientes/ConfirmDialog';
import { Pagination } from '../components/Common/Pagination';

interface ProntuarioFormData {
  pacienteId: string;
  descricao: string;
  diagnostico?: string;
  prescricao?: string;
  dataConsulta: string;
}

export function Prontuarios() {
  const [historicosPage, setHistoricosPage] = useState<PageResponse<HistoricoResponse>>({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true
  });
  const [pacientes, setPacientes] = useState<PacienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPaciente, setSelectedPaciente] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingHistorico, setEditingHistorico] = useState<HistoricoResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [historicoToDelete, setHistoricoToDelete] = useState<HistoricoResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedHistorico, setExpandedHistorico] = useState<string | null>(null);

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  useEffect(() => {
    // Reset page when search term changes
    setCurrentPage(0);
    fetchData();
  }, [debouncedSearchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [historicosData, pacientesData] = await Promise.all([
        fetchHistoricos(),
        apiClient.getPacientesSimples(),
      ]);

      setHistoricosPage(historicosData);
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('❌ Erro ao carregar dados', {
        description: 'Não foi possível carregar os prontuários.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricos = async () => {
    if (debouncedSearchTerm.trim()) {
      return await apiClient.searchHistoricosPaginated(debouncedSearchTerm, currentPage, pageSize);
    } else {
      return await apiClient.getHistoricos(currentPage, pageSize);
    }
  };

  const handleCreateHistorico = async (data: ProntuarioFormData) => {
    try {
      const newHistorico = await apiClient.createHistorico({
        pacienteId: data.pacienteId,
        descricao: data.descricao,
        diagnostico: data.diagnostico,
        prescricao: data.prescricao,
        dataConsulta: data.dataConsulta,
      });

      // Refresh current page
      fetchData();
      
      const paciente = pacientes.find(p => p.id === data.pacienteId);
      
      toast.success('📋 Prontuário criado com sucesso!', {
        description: `Novo registro médico para ${paciente?.nome} em ${format(new Date(data.dataConsulta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      });
    } catch (error: any) {
      console.error('Error creating historico:', error);
      
      let errorMessage = 'Não foi possível criar o prontuário.';
      if (error.message.includes('Paciente não encontrado')) {
        errorMessage = 'Paciente selecionado não foi encontrado.';
      } else if (error.message.includes('não é um profissional')) {
        errorMessage = 'Apenas profissionais podem criar prontuários.';
      }
      
      toast.error('❌ Erro ao criar prontuário', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleUpdateHistorico = async (data: ProntuarioFormData) => {
    if (!editingHistorico) return;

    try {
      const updatedHistorico = await apiClient.updateHistorico(editingHistorico.id, {
        pacienteId: data.pacienteId,
        descricao: data.descricao,
        diagnostico: data.diagnostico,
        prescricao: data.prescricao,
        dataConsulta: data.dataConsulta,
      });

      // Refresh current page
      fetchData();
      
      toast.success('✅ Prontuário atualizado com sucesso!', {
        description: `Registro médico de ${updatedHistorico.paciente.nome} foi atualizado.`,
      });
    } catch (error: any) {
      console.error('Error updating historico:', error);
      toast.error('❌ Erro na atualização', {
        description: error.message || 'Não foi possível atualizar o prontuário.',
      });
      throw error;
    }
  };

  const handleDeleteHistorico = async () => {
    if (!historicoToDelete) return;

    try {
      setDeleting(true);
      await apiClient.deleteHistorico(historicoToDelete.id);
      
      // Refresh current page
      fetchData();
      
      toast.success('✅ Prontuário removido com sucesso!', {
        description: `Registro médico de ${historicoToDelete.paciente.nome} foi removido.`,
      });
      
      setShowDeleteDialog(false);
      setHistoricoToDelete(null);
    } catch (error: any) {
      console.error('Error deleting historico:', error);
      toast.error('❌ Erro ao remover prontuário', {
        description: error.message || 'Não foi possível remover o prontuário.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (historico?: HistoricoResponse) => {
    setEditingHistorico(historico || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHistorico(null);
  };

  const openDeleteDialog = (historico: HistoricoResponse) => {
    setHistoricoToDelete(historico);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setHistoricoToDelete(null);
  };

  const toggleExpanded = (historicoId: string) => {
    setExpandedHistorico(expandedHistorico === historicoId ? null : historicoId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Filter by selected patient on frontend since it's a simple filter
  const filteredHistoricos = selectedPaciente 
    ? historicosPage.content.filter(h => h.paciente?.id === selectedPaciente)
    : historicosPage.content;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando prontuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prontuários</h1>
          <p className="text-gray-600 mt-2">
            Histórico médico dos pacientes ({historicosPage.totalElements} registros)
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Prontuário</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, profissional, descrição ou diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedPaciente}
            onChange={(e) => setSelectedPaciente(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os pacientes</option>
            {pacientes.map(paciente => (
              <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>
            ))}
          </select>
        </div>

        {/* Lista de Prontuários */}
        <div className="space-y-4">
          {filteredHistoricos.length > 0 ? (
            filteredHistoricos.map((historico) => (
              <div
                key={historico.id}
                className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {historico.paciente?.nome}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(historico.dataConsulta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Dr. {historico.profissional?.usuario.nome}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleExpanded(historico.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(historico)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar prontuário"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(historico)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir prontuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Descrição resumida */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {historico.descricao.length > 200 && expandedHistorico !== historico.id
                        ? `${historico.descricao.substring(0, 200)}...`
                        : historico.descricao
                      }
                    </p>
                    {historico.descricao.length > 200 && (
                      <button
                        onClick={() => toggleExpanded(historico.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                      >
                        {expandedHistorico === historico.id ? 'Ver menos' : 'Ver mais'}
                      </button>
                    )}
                  </div>

                  {/* Detalhes expandidos */}
                  {expandedHistorico === historico.id && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {historico.diagnostico && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Stethoscope className="h-4 w-4 text-green-600 mr-2" />
                            <h4 className="font-medium text-gray-900">Diagnóstico</h4>
                          </div>
                          <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                            {historico.diagnostico}
                          </p>
                        </div>
                      )}

                      {historico.prescricao && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Pill className="h-4 w-4 text-purple-600 mr-2" />
                            <h4 className="font-medium text-gray-900">Prescrição Médica</h4>
                          </div>
                          <p className="text-gray-700 bg-purple-50 p-3 rounded-lg whitespace-pre-wrap">
                            {historico.prescricao}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Criado em {format(new Date(historico.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    <div className="flex items-center space-x-2">
                      {historico.diagnostico && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Com Diagnóstico
                        </span>
                      )}
                      {historico.prescricao && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Com Prescrição
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm || selectedPaciente ? 'Nenhum prontuário encontrado' : 'Nenhum prontuário cadastrado'}
              </p>
              {searchTerm || selectedPaciente ? (
                <p className="text-gray-400 text-sm">
                  Tente ajustar os filtros de busca
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  Clique em "Novo Prontuário" para começar
                </p>
              )}
            </div>
          )}
        </div>

        {/* Paginação */}
        {historicosPage.totalElements > 0 && !selectedPaciente && (
          <Pagination
            currentPage={historicosPage.page}
            totalPages={historicosPage.totalPages}
            totalElements={historicosPage.totalElements}
            pageSize={historicosPage.size}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Modal de Prontuário */}
      <ProntuarioModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={editingHistorico ? handleUpdateHistorico : handleCreateHistorico}
        historico={editingHistorico}
        pacientes={pacientes}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteHistorico}
        title="Excluir Prontuário"
        message={`Tem certeza que deseja excluir o prontuário de "${historicoToDelete?.paciente?.nome}" do dia ${historicoToDelete ? format(new Date(historicoToDelete.dataConsulta), 'dd/MM/yyyy', { locale: ptBR }) : ''}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}