import { useState, useEffect } from 'react';
import { Plus, Search, Users, UserCheck, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SecretarioData {
  id: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
  };
  profissionais: {
    id: string;
    profissional: {
      id: string;
      especialidade: string;
      usuario: {
        nome: string;
      };
    };
  }[];
}

export function Secretarios() {
  const [secretarios, setSecretarios] = useState<SecretarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSecretarios();
  }, []);

  const fetchSecretarios = async () => {
    try {
      const { data, error } = await supabase
        .from('secretarios')
        .select(`
          id,
          usuario:usuarios(*),
          profissionais:secretario_profissionais(
            id,
            profissional:profissionais(
              id,
              especialidade,
              usuario:usuarios(nome)
            )
          )
        `);

      if (error) throw error;
      setSecretarios(data || []);
    } catch (error) {
      console.error('Error fetching secretarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSecretarios = secretarios.filter(secretario =>
    secretario.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secretario.usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Secretários</h1>
          <p className="text-gray-600 mt-2">Gerencie secretários e suas vinculações</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
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
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      secretario.usuario.ativo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {secretario.usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="h-5 w-5" />
                </button>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Nenhum profissional vinculado
                    </p>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
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
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum secretário encontrado' : 'Nenhum secretário cadastrado'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}