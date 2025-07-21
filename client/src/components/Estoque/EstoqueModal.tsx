import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Package, FileText, Hash, Calculator, DollarSign, AlertTriangle, Tag, Loader2 } from 'lucide-react';
import { EstoqueResponse } from '../../lib/api';

const estoqueSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  codigo: z.string()
    .min(2, 'Código deve ter pelo menos 2 caracteres')
    .max(50, 'Código deve ter no máximo 50 caracteres'),
  quantidade: z.number()
    .min(0, 'Quantidade deve ser zero ou positiva'),
  unidade: z.string()
    .min(1, 'Unidade é obrigatória')
    .max(10, 'Unidade deve ter no máximo 10 caracteres'),
  valorUnitario: z.number()
    .min(0, 'Valor deve ser positivo')
    .optional(),
  minAlerta: z.number()
    .min(0, 'Alerta mínimo deve ser zero ou positivo'),
  categoria: z.string()
    .max(50, 'Categoria deve ter no máximo 50 caracteres')
    .optional(),
});

type EstoqueFormData = z.infer<typeof estoqueSchema>;

interface EstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstoqueFormData) => Promise<void>;
  item?: EstoqueResponse | null;
  loading?: boolean;
}

const unidadesComuns = [
  'UN', 'CX', 'FR', 'ML', 'MG', 'G', 'KG', 'L', 'CP', 'AMP'
];

const categoriasComuns = [
  'Medicamentos',
  'Material Cirúrgico',
  'Equipamentos',
  'Descartáveis',
  'Higiene',
  'Outros'
];

export function EstoqueModal({ 
  isOpen, 
  onClose, 
  onSave, 
  item, 
  loading = false 
}: EstoqueModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EstoqueFormData>({
    resolver: zodResolver(estoqueSchema),
    defaultValues: {
      quantidade: 0,
      minAlerta: 10,
      unidade: 'UN',
    },
  });

  const watchedQuantidade = watch('quantidade');
  const watchedMinAlerta = watch('minAlerta');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Preencher formulário para edição
        setValue('nome', item.nome);
        setValue('descricao', item.descricao || '');
        setValue('codigo', item.codigo);
        setValue('quantidade', item.quantidade);
        setValue('unidade', item.unidade);
        setValue('valorUnitario', item.valorUnitario ? Number(item.valorUnitario) : 0);
        setValue('minAlerta', item.minAlerta);
        setValue('categoria', item.categoria || '');
      } else {
        // Limpar formulário para novo item
        reset({
          quantidade: 0,
          minAlerta: 10,
          unidade: 'UN',
        });
      }
    }
  }, [isOpen, item, setValue, reset]);

  const onSubmit = async (data: EstoqueFormData) => {
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

  const getStatusAlerta = () => {
    if (watchedQuantidade === 0) {
      return { color: 'text-red-600', text: 'Esgotado', icon: '🔴' };
    } else if (watchedQuantidade <= watchedMinAlerta) {
      return { color: 'text-yellow-600', text: 'Estoque Baixo', icon: '🟡' };
    } else {
      return { color: 'text-green-600', text: 'Disponível', icon: '🟢' };
    }
  };

  const status = getStatusAlerta();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Editar Item do Estoque' : 'Novo Item do Estoque'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nome e Código */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('nome')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Paracetamol 500mg"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('codigo')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: MED001"
                />
              </div>
              {errors.codigo && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo.message}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('descricao')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descrição detalhada do produto..."
              />
            </div>
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {/* Quantidade, Unidade e Alerta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('quantidade', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {errors.quantidade && (
                <p className="mt-1 text-sm text-red-600">{errors.quantidade.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade *
              </label>
              <select
                {...register('unidade')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {unidadesComuns.map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>
              {errors.unidade && (
                <p className="mt-1 text-sm text-red-600">{errors.unidade.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alerta Mínimo *
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('minAlerta', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
              {errors.minAlerta && (
                <p className="mt-1 text-sm text-red-600">{errors.minAlerta.message}</p>
              )}
            </div>
          </div>

          {/* Status Visual */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status do Estoque:</span>
              <span className={`flex items-center space-x-2 text-sm font-medium ${status.color}`}>
                <span>{status.icon}</span>
                <span>{status.text}</span>
              </span>
            </div>
          </div>

          {/* Valor e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Unitário (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('valorUnitario', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              {errors.valorUnitario && (
                <p className="mt-1 text-sm text-red-600">{errors.valorUnitario.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...register('categoria')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasComuns.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
              )}
            </div>
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
                <span>{item ? 'Atualizar' : 'Cadastrar'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}