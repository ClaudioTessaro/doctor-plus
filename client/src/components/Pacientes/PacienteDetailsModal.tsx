import { useState } from 'react';
import { X, User, FileText, Mail, Phone, MapPin, Calendar, Clock, Eye, Edit } from 'lucide-react';
import { PacienteResponse, ConsultaResponse, HistoricoResponse } from '../../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PacienteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: PacienteResponse;
  consultas?: ConsultaResponse[];
  historicos?: HistoricoResponse[];
  onEdit?: () => void;
  loading?: boolean;
}

export function PacienteDetailsModal({ 
  isOpen, 
  onClose, 
  paciente, 
  consultas = [], 
  historicos = [],
  onEdit,
  loading = false 
}: PacienteDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'consultas' | 'historicos'>('info');

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADA':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'REALIZADA':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AGENDADA':
        return '📅';
      case 'CONFIRMADA':
        return '✅';
      case 'CANCELADA':
        return '❌';
      case 'REALIZADA':
        return '✔️';
      default:
        return '❓';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{paciente.nome}</h2>
              <p className="text-gray-600">Detalhes do Paciente</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar paciente"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Informações Pessoais
            </button>
            <button
              onClick={() => setActiveTab('consultas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'consultas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Consultas ({consultas.length})
            </button>
            <button
              onClick={() => setActiveTab('historicos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'historicos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Histórico Médico ({historicos.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{paciente.nome}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                    </label>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 font-mono">{formatCPF(paciente.cpf)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {format(new Date(paciente.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })} 
                        <span className="text-gray-500 ml-2">({paciente.idade} anos)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{paciente.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{formatPhone(paciente.telefone)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cadastrado em
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {format(new Date(paciente.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço Completo
                </label>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">{paciente.endereco}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultas' && (
            <div className="space-y-4">
              {consultas.length > 0 ? (
                consultas.map((consulta) => (
                  <div key={consulta.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dr. {consulta.profissional?.usuario.nome}
                        </h4>
                        <p className="text-sm text-gray-600">{consulta.profissional?.especialidade}</p>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(consulta.status)}`}>
                        <span>{getStatusIcon(consulta.status)}</span>
                        <span>{consulta.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(consulta.dataHora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {consulta.duracaoMinutos} minutos
                      </div>
                      {consulta.valor && (
                        <div className="flex items-center text-green-600 font-medium">
                          R$ {Number(consulta.valor).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    {consulta.observacoes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{consulta.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma consulta registrada</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historicos' && (
            <div className="space-y-4">
              {historicos.length > 0 ? (
                historicos.map((historico) => (
                  <div key={historico.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dr. {historico.profissional?.usuario.nome}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(historico.dataConsulta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Descrição</h5>
                        <p className="text-sm text-gray-600">{historico.descricao}</p>
                      </div>
                      
                      {historico.diagnostico && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Diagnóstico</h5>
                          <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{historico.diagnostico}</p>
                        </div>
                      )}
                      
                      {historico.prescricao && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Prescrição</h5>
                          <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded whitespace-pre-wrap">{historico.prescricao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum histórico médico registrado</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}