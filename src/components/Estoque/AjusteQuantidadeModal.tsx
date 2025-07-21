import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Minus, Calculator, Loader2 } from 'lucide-react';
import { EstoqueResponse } from '../../lib/api';

const ajusteSchema = z.object({
  tipoOperacao: z.enum(['adicionar', 'remover', 'ajustar']),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  motivo: z.string().optional(),
});

type AjusteFormData = z.infer<typeof ajusteSchema>;

interface AjusteQuantidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tipo: 'adicionar' | 'remover' | 'ajustar', quantidade: number, motivo?: string) => Promise<void>;
  item: EstoqueResponse;
  loading?: boolean;
}

export function AjusteQuantidadeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  item, 
  loading = false 
}: AjusteQuantidadeModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AjusteFormData>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: {
      tipoOperacao: 'adicionar',
      quantidade: 1,
    },
  });

  const tipoOperacao = watch('tipoOperacao');
  const quantidade = watch('quantidade');

  const onSubmit = async (data: AjusteFormData) => {
    setSubmitting(true);
    try {
      await onSave(data.tipoOperacao, data.quantidade, data.motivo);
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

  const getNovaQuantidade = () => {
    switch (tipoOperacao) {
      case 'adicionar':
        return item.quantidade + quantidade;
      case 'remover':
        return Math.max(0, item.quantidade - quantidade);
      case 'ajustar':
        return quantidade;
      default:
        return item.quantidade;
    }
  };

  const getOperacaoInfo = () => {
    switch (tipoOperacao) {
      case 'adicionar':
        return {
          icon: Plus,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Adicionar ao Estoque',
          description: 'Aumentar a quantidade disponível'
        };
      case 'remover':
        return {
          icon: Minus,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Remover do Estoque',
          description: 'Diminuir a quantidade disponível'
        };
      case 'ajustar':
        return {
          icon: Calculator,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Ajustar Quantidade',
          description: 'Definir nova quantidade total'
        };
      default:
        return {
          icon: Calculator,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Ajustar Estoque',
          description: 'Modificar quantidade'
        };
    }
  };

  const operacao = getOperacaoInfo();
  const Icon = operacao.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ajustar Estoque</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Informações do Item */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{item.nome}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Código:</strong> {item.codigo}</p>
              <p><strong>Quantidade Atual:</strong> {item.quantidade} {item.unidade}</p>
              <p><strong>Alerta Mínimo:</strong> {item.minAlerta} {item.unidade}</p>
            </div>
          </div>

          {/* Tipo de Operação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setValue('tipoOperacao', 'adicionar')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  tipoOperacao === 'adicionar'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plus className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Adicionar</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('tipoOperacao', 'remover')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  tipoOperacao === 'remover'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minus className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Remover</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('tipoOperacao', 'ajustar')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  tipoOperacao === 'ajustar'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calculator className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Ajustar</span>
              </button>
            </div>
          </div>

          {/* Operação Selecionada */}
          <div className={`p-4 rounded-lg border ${operacao.bgColor} ${operacao.borderColor}`}>
            <div className="flex items-center space-x-3 mb-2">
              <Icon className={`h-5 w-5 ${operacao.color}`} />
              <div>
                <h4 className={`font-medium ${operacao.color}`}>{operacao.title}</h4>
                <p className="text-sm text-gray-600">{operacao.description}</p>
              </div>
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tipoOperacao === 'ajustar' ? 'Nova Quantidade Total' : 'Quantidade'}
            </label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register('quantidade', { valueAsNumber: true })}
                type="number"
                min="1"
                max={tipoOperacao === 'remover' ? item.quantidade : undefined}
                className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {item.unidade}
              </span>
            </div>
            {errors.quantidade && (
              <p className="mt-1 text-sm text-red-600">{errors.quantidade.message}</p>
            )}
            {tipoOperacao === 'remover' && quantidade > item.quantidade && (
              <p className="mt-1 text-sm text-red-600">
                Quantidade não pode ser maior que o estoque atual ({item.quantidade})
              </p>
            )}
          </div>

          {/* Preview da Nova Quantidade */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Nova Quantidade:</span>
              <span className="text-lg font-bold text-blue-900">
                {getNovaQuantidade()} {item.unidade}
              </span>
            </div>
            {getNovaQuantidade() <= item.minAlerta && (
              <p className="text-xs text-yellow-700 mt-1">
                ⚠️ Ficará abaixo do limite mínimo ({item.minAlerta} {item.unidade})
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo (Opcional)
            </label>
            <textarea
              {...register('motivo')}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ex: Entrada de mercadoria, uso em procedimento, ajuste de inventário..."
            />
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
              disabled={submitting || (tipoOperacao === 'remover' && quantidade > item.quantidade)}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${operacao.color.replace('text-', 'bg-').replace('-600', '-600 hover:bg-').replace('600 hover:bg-', '600 hover:bg-').replace('-600', '-700')}`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4" />
                  <span>Confirmar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}