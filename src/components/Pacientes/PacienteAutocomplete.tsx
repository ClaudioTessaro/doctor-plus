import { useState, useEffect, useRef } from 'react';
import { Search, User, X, ChevronDown } from 'lucide-react';
import { PacienteResponse } from '../../lib/api';

interface PacienteAutocompleteProps {
  value?: string;
  onChange: (pacienteId: string, paciente?: PacienteResponse) => void;
  pacientes: PacienteResponse[];
  onSearch?: (term: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function PacienteAutocomplete({
  value,
  onChange,
  pacientes,
  onSearch,
  placeholder = "Buscar paciente...",
  error,
  disabled = false,
  required = false
}: PacienteAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteResponse | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Encontrar paciente selecionado quando value muda
  useEffect(() => {
    if (value) {
      const paciente = pacientes.find(p => p.id === value);
      setSelectedPaciente(paciente || null);
      setSearchTerm(paciente?.nome || '');
    } else {
      setSelectedPaciente(null);
      setSearchTerm('');
    }
  }, [value, pacientes]);

  // Debounce do termo de busca
  useEffect(() => {
    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Configurar novo timeout de 4 segundos
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 4000);

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Executar busca quando debouncedSearchTerm muda
  useEffect(() => {
    if (debouncedSearchTerm && onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  // Filtrar pacientes baseado no termo de busca
  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.cpf.includes(searchTerm) ||
    paciente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredPacientes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredPacientes[highlightedIndex]) {
          handleSelectPaciente(filteredPacientes[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll para item destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // Limpar seleção se o termo não corresponder ao paciente selecionado
    if (selectedPaciente && !selectedPaciente.nome.toLowerCase().includes(term.toLowerCase())) {
      setSelectedPaciente(null);
      onChange('');
    }
  };

  const handleSelectPaciente = (paciente: PacienteResponse) => {
    setSelectedPaciente(paciente);
    setSearchTerm(paciente.nome);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(paciente.id, paciente);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSelectedPaciente(null);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange('');
    inputRef.current?.focus();
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          } ${
            disabled 
              ? 'bg-gray-50 cursor-not-allowed' 
              : 'bg-white'
          }`}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {selectedPaciente && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {selectedPaciente && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{selectedPaciente.nome}</p>
              <p className="text-xs text-blue-700">
                CPF: {formatCPF(selectedPaciente.cpf)} • 
                Tel: {formatPhone(selectedPaciente.telefone)} • 
                {selectedPaciente.idade} anos
              </p>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredPacientes.length > 0 ? (
            <ul ref={listRef} className="py-1">
              {filteredPacientes.map((paciente, index) => (
                <li key={paciente.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPaciente(paciente)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                      index === highlightedIndex ? 'bg-blue-50' : ''
                    } ${
                      selectedPaciente?.id === paciente.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {paciente.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          CPF: {formatCPF(paciente.cpf)} • {paciente.idade} anos
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {paciente.email} • {formatPhone(paciente.telefone)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Digite para buscar pacientes'}
              </p>
              {searchTerm && (
                <p className="text-xs text-gray-400 mt-1">
                  Tente buscar por nome, CPF ou email
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}