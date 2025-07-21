import { useState, useEffect } from 'react';
import { Plus, Search, Stethoscope, Mail, Calendar, Edit } from 'lucide-react';
import { apiClient, ProfissionalResponse } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Profissionais() {
  const [profissionais, setProfissionais] = useState<ProfissionalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce do termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProfissionais();
  }, []);

  const fetchProfissionais = async () => {
    try {
      const data = await apiClient.getProfissionais();
      setProfissionais(data);
    } catch (error) {
      console.error('Error fetching profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfissionais = profissionais.filter(profissional =>
    profissional.usuario.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    profissional.especialidade.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    profissional.crm.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-2">Gerencie profissionais de saúde</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Novo Profissional</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, especialidade ou CRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredProfissionais.map((profissional) => (
            <div
              key={profissional.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Dr. {profissional.usuario.nome}
                    </h3>
                    <p className="text-blue-600 font-medium mt-1">
                      {profissional.especialidade}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      CRM: {profissional.crm}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {profissional.usuario.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Desde {format(new Date(profissional.createdAt), 'MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>

                    <span className={`inline-block px-3 py-1 text-sm rounded-full mt-3 ${
                      profissional.usuario.ativo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {profissional.usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProfissionais.length === 0 && (
            <div className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}