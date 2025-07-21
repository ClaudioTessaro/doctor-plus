import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiClient, ConsultaResponse } from '../lib/api';

export function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultas, setConsultas] = useState<ConsultaResponse[]>([]);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultas();
  }, [currentDate, view]);

  const fetchConsultas = async () => {
    try {
      let startDate, endDate;

      if (view === 'day') {
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      }

      const data = await apiClient.getConsultasByPeriodo(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setConsultas(data);
    } catch (error) {
      console.error('Error fetching consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'day') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
    } else {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 7) : subDays(currentDate, 7));
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getConsultasForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return consultas.filter(consulta => {
      const consultaDate = new Date(consulta.dataHora);
      return consultaDate >= dayStart && consultaDate <= dayEnd;
    });
  };

  const formatDateRange = () => {
    if (view === 'day') {
      return format(currentDate, 'dd/MM/yyyy', { locale: ptBR });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'dd/MM', { locale: ptBR })} - ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
  };

  const renderConsulta = (consulta: ConsultaResponse) => (
    <div
      key={consulta.id}
      className={`p-3 rounded-lg border-l-4 ${
        consulta.status === 'AGENDADA' ? 'border-yellow-400 bg-yellow-50' :
        consulta.status === 'CONFIRMADA' ? 'border-green-400 bg-green-50' :
        consulta.status === 'CANCELADA' ? 'border-red-400 bg-red-50' :
        'border-blue-400 bg-blue-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{consulta.paciente?.nome}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          consulta.status === 'AGENDADA' ? 'bg-yellow-100 text-yellow-700' :
          consulta.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' :
          consulta.status === 'CANCELADA' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {consulta.status}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        <div className="flex items-center mb-1">
          <Clock className="h-4 w-4 mr-1" />
          {format(new Date(consulta.dataHora), 'HH:mm', { locale: ptBR })}
          <span className="ml-2">({consulta.duracaoMinutos}min)</span>
        </div>
        <div>Dr. {consulta.profissional?.usuario.nome}</div>
        {consulta.observacoes && (
          <div className="mt-2 text-xs text-gray-500">
            {consulta.observacoes}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-2">Gerencie consultas e agendamentos</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nova Consulta</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {/* Header da Agenda */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDateRange()}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Semana
              </button>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Visualização da Agenda */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : view === 'day' ? (
          /* Visualização por Dia */
          <div className="space-y-4">
            {getConsultasForDay(currentDate).length > 0 ? (
              getConsultasForDay(currentDate).map(renderConsulta)
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma consulta agendada para este dia</p>
              </div>
            )}
          </div>
        ) : (
          /* Visualização por Semana */
          <div className="grid grid-cols-7 gap-4">
            {getWeekDays().map((day) => {
              const dayConsultas = getConsultasForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

              return (
                <div key={day.toString()} className="min-h-96">
                  <div className={`text-center p-3 rounded-lg mb-4 ${
                    isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700'
                  }`}>
                    <div className="text-sm font-medium">
                      {format(day, 'EEEE', { locale: ptBR })}
                    </div>
                    <div className="text-lg font-bold">
                      {format(day, 'dd', { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayConsultas.map((consulta) => (
                      <div
                        key={consulta.id}
                        className={`p-2 rounded text-xs border-l-2 ${
                          consulta.status === 'AGENDADA' ? 'border-yellow-400 bg-yellow-50' :
                          consulta.status === 'CONFIRMADA' ? 'border-green-400 bg-green-50' :
                          consulta.status === 'CANCELADA' ? 'border-red-400 bg-red-50' :
                          'border-blue-400 bg-blue-50'
                        }`}
                      >
                        <div className="font-medium truncate">
                          {consulta.paciente?.nome}
                        </div>
                        <div className="text-gray-600">
                          {format(new Date(consulta.dataHora), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}