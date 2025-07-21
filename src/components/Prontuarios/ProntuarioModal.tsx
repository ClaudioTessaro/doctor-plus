import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, FileText, Calendar, Stethoscope, Pill, Loader2 } from 'lucide-react';
import { HistoricoResponse, PacienteResponse } from '../../lib/api';
import { PacienteAutocomplete } from '../Pacientes/PacienteAutocomplete';

const prontuarioSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  descricao: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  diagnostico: z.string()
    .max(1000, 'Diagnóstico deve ter no máximo 1000 caracteres')
    .optional(),
  prescricao: z.string()
    .max(2000, 'Prescrição deve ter no máximo 2000 caracteres')
    .optional(),
  dataConsulta: z.string().min(1, 'Data da consulta é obrigatória'),
});

type ProntuarioFormData = z.infer<typeof prontuarioSchema>;

interface ProntuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProntuarioFormData) => Promise<void>;
  historico?: HistoricoResponse | null;
  pacientes: PacienteResponse[];
  loading?: boolean;
}

export function ProntuarioModal({ 
  isOpen, 
  onClose, 
  onSave, 
  historico, 
  pacientes, 
  loading = false 
}: ProntuarioModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<ProntuarioFormData>({
    resolver: zodResolver(prontuarioSchema),
  });

  const watchedPaciente = watch('pacienteId');

  useEffect(() => {
    if (isOpen) {
      if (historico) {
        // Preencher formulário para edição
        setValue('pacienteId', historico.paciente.id);
        setValue('descricao', historico.descricao);
        setValue('diagnostico', historico.diagnostico || '');
        setValue('prescricao', historico.prescricao || '');
        setValue('dataConsulta', new Date(historico.dataConsulta).toISOString().slice(0, 16));
      } else {
        // Limpar formulário para novo prontuário
        reset({
          dataConsulta: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [isOpen, historico, setValue, reset]);

  const onSubmit = async (data: ProntuarioFormData) => {
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

  const handlePacienteChange = (pacienteId: string, paciente?: PacienteResponse) => {
    setValue('pacienteId', pacienteId);
    if (pacienteId) {
      clearErrors('pacienteId');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {historico ? 'Editar Prontuário' : 'Novo Prontuário'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Paciente e Data da Consulta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <PacienteAutocomplete
                value={watchedPaciente}
                onChange={handlePacienteChange}
                pacientes={pacientes}
                placeholder="Buscar paciente por nome, CPF ou email..."
                error={errors.pacienteId?.message}
                required
                disabled={!!historico} // Não permite alterar paciente na edição
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Consulta *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('dataConsulta')}
                  type="datetime-local"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.dataConsulta && (
                <p className="mt-1 text-sm text-red-600">{errors.dataConsulta.message}</p>
              )}
            </div>
          </div>

          {/* Descrição da Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Consulta *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('descricao')}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descreva os sintomas, queixas e observações da consulta..."
              />
            </div>
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 10 caracteres, máximo 2000 caracteres
            </p>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('diagnostico')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Diagnóstico médico, CID, observações clínicas..."
              />
            </div>
            {errors.diagnostico && (
              <p className="mt-1 text-sm text-red-600">{errors.diagnostico.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Máximo 1000 caracteres (opcional)
            </p>
          </div>

          {/* Prescrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescrição Médica
            </label>
            <div className="relative">
              <Pill className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('prescricao')}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Medicamentos prescritos, dosagens, orientações de uso, recomendações..."
              />
            </div>
            {errors.prescricao && (
              <p className="mt-1 text-sm text-red-600">{errors.prescricao.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Máximo 2000 caracteres (opcional)
            </p>
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
                <span>{historico ? 'Atualizar' : 'Salvar'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}