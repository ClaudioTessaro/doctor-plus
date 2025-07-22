import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ConsultaResponse } from '../../lib/api';

interface StatusDropdownProps {
  consulta: ConsultaResponse;
  onStatusChange: (consulta: ConsultaResponse, novoStatus: string) => void;
  compact?: boolean;
}

export function StatusDropdown({ consulta, onStatusChange, compact = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(consulta, newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${compact ? 'p-0.5' : 'p-2'} text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center ${compact ? 'space-x-0' : 'space-x-1'}`}
        title="Alterar status"
      >
        <span className={compact ? "text-xs" : "text-sm"}>●●●</span>
        {!compact && <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-20">
            {availableOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center space-x-2 ${option.color}`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}