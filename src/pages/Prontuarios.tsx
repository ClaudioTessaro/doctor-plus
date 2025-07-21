import { useState, useEffect } from 'react';
import { FileText, Search, Plus, Eye, Calendar, User } from 'lucide-react';
import { supabase, Historico } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Prontuarios() {
  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistoricos();
  }, []);

  const fetchHistoricos = async () => {
    try {
      const { data, error } = await supabase
        .from('historicos')
        .select(`
          *,
          paciente:pacientes(*),
          profissional:profissionais(*, usuario:usuarios(*))
        `)
        .order('data_consulta', { ascending: false });

      if (error) throw error;
      setHistoricos(data || []);
    } catch (error) {
      console.error('Error fetching historicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistoricos = historicos.filter(historico =>
    historico.paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    historico.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    historico.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prontuários</h1>
          <p className="text-gray-600 mt-2">Histórico médico dos pacientes</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Novo Prontuário</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, descrição ou diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistoricos.map((historico) => (
            <div
              key={historico.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {historico.paciente?.nome}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(historico.data_consulta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Dr. {historico.profissional?.usuario?.nome}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Descrição da Consulta</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {historico.descricao}
                  </p>
                </div>

                {historico.diagnostico && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Diagnóstico</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {historico.diagnostico}
                    </p>
                  </div>
                )}

                {historico.prescricao && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Prescrição</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {historico.prescricao}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Criado em {format(new Date(historico.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    Gerar Receita
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredHistoricos.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum prontuário encontrado' : 'Nenhum prontuário cadastrado'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}