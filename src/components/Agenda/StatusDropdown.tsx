import { ConsultaResponse } from '../../lib/api';

interface StatusDropdownProps {
  consulta: ConsultaResponse;
  onStatusChange: (consulta: ConsultaResponse, novoStatus: string) => void;
  className?: string;
}

export function StatusDropdown({ consulta, onStatusChange, className = '' }: StatusDropdownProps) {
  const statusOptions = [
    { value: 'AGENDADA', label: 'Agendada', color: 'text-yellow-700 hover:bg-yellow-50', icon: '📅' },
    { value: 'CONFIRMADA', label: 'Confirmada', color: 'text-green-700 hover:bg-green-50', icon: '✅' },
    { value: 'REALIZADA', label: 'Realizada', color: 'text-blue-700 hover:bg-blue-50', icon: '✔️' },
    { value: 'CANCELADA', label: 'Cancelada', color: 'text-red-700 hover:bg-red-50', icon: '❌' },
  ];

  const availableOptions = statusOptions.filter(option => option.value !== consulta.status);

  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-50 ${className}`}>
      {availableOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onStatusChange(consulta, option.value)}
          className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center space-x-2 ${option.color}`}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}