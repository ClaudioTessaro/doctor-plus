import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Calendar, Clock, FileText, DollarSign, Loader2 } from 'lucide-react';
import { ConsultaResponse, PacienteResponse, ProfissionalResponse } from '../../lib/api';

const agendamentoSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  profissionalId: z.string().min(1, 'Profissional é obrigatório'),
  dataHora: z.string().min(1, 'Data e hora são obrigatórias'),
  duracaoMinutos: z.number().min(15, 'Duração mínima é 15 minutos').max(480, 'Duração máxima é 8 horas'),
  observacoes: z.string().optional(),
  valor: z.number().min(0, 'Valor deve ser positivo').optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AgendamentoFormData) => Promise<void>;
  consulta?: ConsultaResponse | null;
  pacientes: PacienteResponse[];
  profissionais: ProfissionalResponse[];
  loading?: boolean;
}

export function AgendamentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  consulta, 
  pacientes, 
  profissionais, 
  loading = false 
}: AgendamentoModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      duracaoMinutos: 60,
      valor: 0,
    },
  });

  const watchedProfissional = watch('profissionalId');

  useEffect(() => {
    if (isOpen) {
      if (consulta) {
        // Preencher formulário para edição
        setValue('pacienteId', consulta.paciente.id);
        setValue('profissionalId', consulta.profissional.id);
        setValue('dataHora', new Date(consulta.dataHora).toISOString().slice(0, 16));
        setValue('duracaoMinutos', consulta.duracaoMinutos);
        setValue('observacoes', consulta.observacoes || '');
        setValue('valor', consulta.valor ? Number(consulta.valor) : 0);
      } else {
        // Limpar formulário para nova consulta
        reset({
          duracaoMinutos: 60,
          valor: 0,
        });
      }
    }
  }, [isOpen, consulta, setValue, reset]);

  const onSubmit = async (data: AgendamentoFormData) => {
    setSubmitting(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Mínimo 30 minutos no futuro
    return now.toISOString().slice(0, 16);
  };

  const selectedProfissional = profissionais.find(p => p.id === watchedProfissional);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {consulta ? 'Editar Consulta' : 'Agendar Nova Consulta'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Paciente e Profissional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...register('pacienteId')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome} - {paciente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    </option>
                  ))}
                </select>
              </div>
              {errors.pacienteId && (
                <p className="mt-1 text-sm text-red-600">{errors.pacienteId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...register('profissionalId')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      Dr. {profissional.usuario.nome} - {profissional.especialidade}
                    </option>
                  ))}
                </select>
              </div>
              {errors.profissionalId && (
                <p className="mt-1 text-sm text-red-600">{errors.profissionalId.message}</p>
              )}
              {selectedProfissional && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>CRM:</strong> {selectedProfissional.crm}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Data/Hora e Duração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('dataHora')}
                  type="datetime-local"
                  min={getMinDateTime()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.dataHora && (
                <p className="mt-1 text-sm text-red-600">{errors.dataHora.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (minutos) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...register('duracaoMinutos', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h 30min</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
              {errors.duracaoMinutos && (
                <p className="mt-1 text-sm text-red-600">{errors.duracaoMinutos.message}</p>
              )}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Consulta (R$)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register('valor', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('observacoes')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Observações sobre a consulta..."
              />
            </div>
            {errors.observacoes && (
              <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{consulta ? 'Atualizar' : 'Agendar'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}