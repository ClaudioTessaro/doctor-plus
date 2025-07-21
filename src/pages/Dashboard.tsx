import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { useEffect, useState } from 'react';
import { supabase, Consulta } from '../lib/supabase';

export function Dashboard() {
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([]);

  useEffect(() => {
    fetchProximasConsultas();
  }, []);

  const fetchProximasConsultas = async () => {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          paciente:pacientes(*),
          profissional:profissionais(*, usuario:usuarios(*))
        `)
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(5);

      if (error) throw error;
      setProximasConsultas(data || []);
    } catch (error) {
      console.error('Error fetching consultas:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo ao DoctorPlus. Aqui você pode gerenciar todos os aspectos da sua clínica.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Consultas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Próximas Consultas</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {proximasConsultas.length > 0 ? (
              proximasConsultas.map((consulta) => (
                <div key={consulta.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {consulta.paciente?.nome}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        consulta.status === 'AGENDADA' ? 'bg-yellow-100 text-yellow-700' :
                        consulta.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {consulta.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(consulta.data_hora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      Dr. {consulta.profissional?.usuario?.nome}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma consulta agendada</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Alertas e Notificações</h3>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Estoque Baixo</h4>
                <p className="text-sm text-red-700">
                  3 medicamentos estão com estoque abaixo do limite mínimo
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Consultas Pendentes</h4>
                <p className="text-sm text-yellow-700">
                  2 consultas precisam de confirmação
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Novos Pacientes</h4>
                <p className="text-sm text-blue-700">
                  5 novos pacientes cadastrados esta semana
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}