import { useState, useEffect } from 'react';
import { Plus, Search, Users, UserCheck, Edit, Settings, Trash2, Loader2 } from 'lucide-react';
import { apiClient, SecretarioResponse, ProfissionalResponse } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { SecretarioModal } from '../components/Secretarios/SecretarioModal';
import { VinculoProfissionalModal } from '../components/Secretarios/VinculoProfissionalModal';
import { ConfirmDialog } from '../components/Pacientes/ConfirmDialog';

interface SecretarioFormData {
  nome: string;
  email: string;
  senha?: string;
  dataNascimento: string;
}

export function Secretarios() {
  const [secretarios, setSecretarios] = useState<SecretarioResponse[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSecretario, setEditingSecretario] = useState<SecretarioResponse | null>(null);
  const [showVinculoModal, setShowVinculoModal] = useState(false);
  const [secretarioParaVinculo, setSecretarioParaVinculo] = useState<SecretarioResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [secretarioToDelete, setSecretarioToDelete] = useState<SecretarioResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 4000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [secretariosData, profissionaisData] = await Promise.all([
        apiClient.getSecretarios(),
        apiClient.getProfissionais(),
      ]);

      setSecretarios(secretariosData);
      setProfissionais(profissionaisData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('❌ Erro ao carregar dados', {
        description: 'Não foi possível carregar os secretários.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSecretario = async (data: SecretarioFormData) => {
    try {
      const newSecretario = await apiClient.createSecretario(data);
      setSecretarios(prev => [newSecretario, ...prev]);
      
      toast.success('👤 Secretário cadastrado com sucesso!', {
        description: `${data.nome} foi adicionado ao sistema.`,
      });
    } catch (error: any) {
      console.error('Error creating secretario:', error);
      
      let errorMessage = 'Não foi possível cadastrar o secretário.';
      if (error.message.includes('Email já está em uso')) {
        errorMessage = 'Este e-mail já está cadastrado no sistema.';
      } else if (error.message.includes('maior de 18 anos')) {
        errorMessage = 'O secretário deve ser maior de 18 anos.';
      }
      
      toast.error('❌ Erro no cadastro', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleUpdateSecretario = async (data: SecretarioFormData) => {
    if (!editingSecretario) return;

    try {
      const updatedSecretario = await apiClient.updateSecretario(editingSecretario.id, data);
      setSecretarios(prev => 
        prev.map(s => s.id === editingSecretario.id ? updatedSecretario : s)
      );
      
      toast.success('✅ Secretário atualizado com sucesso!', {
        description: `Dados de ${data.nome} foram atualizados.`,
      });
    } catch (error: any) {
      console.error('Error updating secretario:', error);
      
      let errorMessage = 'Não foi possível atualizar o secretário.';
      if (error.message.includes('Email já está em uso')) {
        errorMessage = 'Este e-mail já está cadastrado para outro usuário.';
      }
      
      toast.error('❌ Erro na atualização', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleVincularProfissional = async (profissionalId: string) => {
    if (!secretarioParaVinculo) return;

    try {
      const updatedSecretario = await apiClient.vincularProfissional(
        secretarioParaVinculo.id, 
        profissionalId
      );
      
      setSecretarios(prev => 
        prev.map(s => s.id === secretarioParaVinculo.id ? updatedSecretario : s)
      );
      
      const profissional = profissionais.find(p => p.id === profissionalId);
      
      toast.success('🔗 Profissional vinculado!', {
        description: `Dr. ${profissional?.usuario.nome} foi vinculado ao secretário.`,
      });
      
      // Atualizar dados do modal
      setSecretarioParaVinculo(updatedSecretario);
    } catch (error: any) {
      console.error('Error linking professional:', error);
      
      let errorMessage = 'Não foi possível vincular o profissional.';
      if (error.message.includes('já está vinculado')) {
        errorMessage = 'Este profissional já está vinculado ao secretário.';
      }
      
      toast.error('❌ Erro na vinculação', {
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleDesvincularProfissional = async (profissionalId: string) => {
    if (!secretarioParaVinculo) return;

    try {
      await apiClient.desvincularProfissional(secretarioParaVinculo.id, profissionalId);
      
      // Atualizar estado local
      const updatedSecretario = {
        ...secretarioParaVinculo,
        profissionais: secretarioParaVinculo.profissionais.filter(
          v => v.profissional.id !== profissionalId
        )
      };
      
      setSecretarios(prev => 
        prev.map(s => s.id === secretarioParaVinculo.id ? updatedSecretario : s)
      );
      
      const profissional = profissionais.find(p => p.id === profissionalId);
      
      toast.success('🔓 Profissional desvinculado!', {
        description: `Dr. ${profissional?.usuario.nome} foi desvinculado do secretário.`,
      });
      
      // Atualizar dados do modal
      setSecretarioParaVinculo(updatedSecretario);
    } catch (error: any) {
      console.error('Error unlinking professional:', error);
      toast.error('❌ Erro ao desvincular', {
        description: error.message || 'Não foi possível desvincular o profissional.',
      });
      throw error;
    }
  };

  const handleDeleteSecretario = async () => {
    if (!secretarioToDelete) return;

    try {
      setDeleting(true);
      await apiClient.desativarSecretario(secretarioToDelete.id);
      
      setSecretarios(prev => prev.filter(s => s.id !== secretarioToDelete.id));
      
      toast.success('✅ Secretário desativado com sucesso!', {
        description: `${secretarioToDelete.usuario.nome} foi desativado do sistema.`,
      });
      
      setShowDeleteDialog(false);
      setSecretarioToDelete(null);
    } catch (error: any) {
      console.error('Error deleting secretario:', error);
      toast.error('❌ Erro ao desativar secretário', {
        description: error.message || 'Não foi possível desativar o secretário.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (secretario?: SecretarioResponse) => {
    setEditingSecretario(secretario || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSecretario(null);
  };

  const openVinculoModal = (secretario: SecretarioResponse) => {
    setSecretarioParaVinculo(secretario);
    setShowVinculoModal(true);
  };

  const closeVinculoModal = () => {
    setShowVinculoModal(false);
    setSecretarioParaVinculo(null);
  };

  const openDeleteDialog = (secretario: SecretarioResponse) => {
    setSecretarioToDelete(secretario);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSecretarioToDelete(null);
  };

  const filteredSecretarios = secretarios.filter(secretario =>
    secretario.usuario.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    secretario.usuario.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando secretários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Secretários</h1>
          <p className="text-gray-600 mt-2">
            Gerencie secretários e suas vinculações ({secretarios.length} cadastrados)
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Secretário</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredSecretarios.map((secretario) => (
            <div
              key={secretario.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {secretario.usuario.nome}
                    </h3>
                    <p className="text-sm text-gray-600">{secretario.usuario.email}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        secretario.usuario.ativo 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {secretario.usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Cadastrado em {format(new Date(secretario.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(secretario)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar secretário"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openVinculoModal(secretario)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Gerenciar vinculações"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(secretario)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Desativar secretário"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Profissionais Vinculados ({secretario.profissionais.length})
                </h4>
                
                {secretario.profissionais.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {secretario.profissionais.map((vinculo) => (
                      <div
                        key={vinculo.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="font-medium text-blue-900">
                          Dr. {vinculo.profissional.usuario.nome}
                        </div>
                        <div className="text-sm text-blue-700">
                          {vinculo.profissional.especialidade}
                        </div>
                        <div className="text-xs text-blue-600">
                          CRM: {vinculo.profissional.crm}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-2">
                      Nenhum profissional vinculado
                    </p>
                    <button 
                      onClick={() => openVinculoModal(secretario)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Vincular profissional
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredSecretarios.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm ? 'Nenhum secretário encontrado' : 'Nenhum secretário cadastrado'}
              </p>
              {searchTerm ? (
                <p className="text-gray-400 text-sm">
                  Tente buscar por nome ou e-mail
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  Clique em "Novo Secretário" para começar
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <SecretarioModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={editingSecretario ? handleUpdateSecretario : handleCreateSecretario}
        secretario={editingSecretario}
      />

      {/* Modal de Vinculação */}
      {secretarioParaVinculo && (
        <VinculoProfissionalModal
          isOpen={showVinculoModal}
          onClose={closeVinculoModal}
          onVincular={handleVincularProfissional}
          onDesvincular={handleDesvincularProfissional}
          secretario={secretarioParaVinculo}
          profissionaisDisponiveis={profissionais}
        />
      )}

      {/* Dialog de Confirmação de Desativação */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteSecretario}
        title="Desativar Secretário"
        message={`Tem certeza que deseja desativar o secretário "${secretarioToDelete?.usuario.nome}"? Ele perderá acesso ao sistema, mas os dados serão mantidos.`}
        confirmText="Desativar"
        cancelText="Cancelar"
        type="warning"
        loading={deleting}
      />
    </div>
  );
}