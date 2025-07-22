import { useState, useEffect } from 'react';
import { X, Users, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { SecretarioResponse, ProfissionalResponse } from '../../lib/api';

interface VinculoProfissionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVincular: (profissionalId: string) => Promise<void>;
  onDesvincular: (profissionalId: string) => Promise<void>;
  secretario: SecretarioResponse;
  profissionaisDisponiveis: ProfissionalResponse[];
  loading?: boolean;
}

export function VinculoProfissionalModal({
  isOpen,
  onClose,
  onVincular,
  onDesvincular,
  secretario,
  profissionaisDisponiveis,
  loading = false
}: VinculoProfissionalModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleVincular = async (profissionalId: string) => {
    setSubmitting(true);
    try {
      await onVincular(profissionalId);
    } catch (error) {
      // Erro tratado no componente pai
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesvincular = async (profissionalId: string) => {
    setSubmitting(true);
    try {
      await onDesvincular(profissionalId);
    } catch (error) {
      // Erro tratado no componente pai
    } finally {
      setSubmitting(false);
    }
  };

  const profissionaisVinculados = secretario.profissionais.map(v => v.profissional);
  const profissionaisNaoVinculados = profissionaisDisponiveis.filter(
    prof => !profissionaisVinculados.some(vinc => vinc.id === prof.id)
  );

  const filteredProfissionais = profissionaisNaoVinculados.filter(prof =>
    prof.usuario.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    prof.especialidade.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    prof.crm.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Gerenciar Vinculações - {secretario.usuario.nome}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profissionais Vinculados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Profissionais Vinculados ({profissionaisVinculados.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {profissionaisVinculados.length > 0 ? (
                  profissionaisVinculados.map((profissional) => (
                    <div
                      key={profissional.id}
                      className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">
                          Dr. {profissional.usuario.nome}
                        </h4>
                        <p className="text-sm text-green-700">{profissional.especialidade}</p>
                        <p className="text-xs text-green-600">CRM: {profissional.crm}</p>
                      </div>
                      <button
                        onClick={() => handleDesvincular(profissional.id)}
                        disabled={submitting}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Desvincular profissional"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum profissional vinculado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profissionais Disponíveis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profissionais Disponíveis
              </h3>
              
              {/* Busca */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, especialidade ou CRM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProfissionais.length > 0 ? (
                  filteredProfissionais.map((profissional) => (
                    <div
                      key={profissional.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          Dr. {profissional.usuario.nome}
                        </h4>
                        <p className="text-sm text-gray-600">{profissional.especialidade}</p>
                        <p className="text-xs text-gray-500">CRM: {profissional.crm}</p>
                      </div>
                      <button
                        onClick={() => handleVincular(profissional.id)}
                        disabled={submitting}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Vincular profissional"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>
                      {searchTerm 
                        ? 'Nenhum profissional encontrado' 
                        : 'Todos os profissionais já estão vinculados'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}