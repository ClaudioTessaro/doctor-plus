const API_BASE_URL = 'http://localhost:8080/api';

// Configuração do cliente HTTP
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, senha: string) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  }

  async register(userData: RegisterRequest) {
    return this.request<UsuarioResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Usuários endpoints
  async getUsuarios() {
    return this.request<UsuarioResponse[]>('/usuarios');
  }

  async getUsuario(id: string) {
    return this.request<UsuarioResponse>(`/usuarios/${id}`);
  }

  async updateUsuario(id: string, data: Partial<RegisterRequest>) {
    return this.request<UsuarioResponse>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Pacientes endpoints
  async getPacientes() {
    return this.request<PacienteResponse[]>('/pacientes');
  }

  async getPaciente(id: string) {
    return this.request<PacienteResponse>(`/pacientes/${id}`);
  }

  async createPaciente(data: PacienteCreateRequest) {
    return this.request<PacienteResponse>('/pacientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaciente(id: string, data: PacienteCreateRequest) {
    return this.request<PacienteResponse>(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaciente(id: string) {
    return this.request(`/pacientes/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPacientes(termo: string) {
    return this.request<PacienteResponse[]>(`/pacientes/buscar?termo=${encodeURIComponent(termo)}`);
  }

  // Consultas endpoints
  async getConsultas() {
    return this.request<ConsultaResponse[]>('/consultas/proximas');
  }

  async getConsultasByPeriodo(inicio: string, fim: string) {
    return this.request<ConsultaResponse[]>(`/consultas/periodo?inicio=${inicio}&fim=${fim}`);
  }

  async getConsultasByPaciente(pacienteId: string) {
    return this.request<ConsultaResponse[]>(`/consultas/paciente/${pacienteId}`);
  }

  async createConsulta(data: ConsultaCreateRequest) {
    return this.request<ConsultaResponse>('/consultas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConsulta(id: string, data: ConsultaCreateRequest) {
    return this.request<ConsultaResponse>(`/consultas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelarConsulta(id: string) {
    return this.request(`/consultas/${id}/cancelar`, {
      method: 'PATCH',
    });
  }

  async confirmarConsulta(id: string) {
    return this.request(`/consultas/${id}/confirmar`, {
      method: 'PATCH',
    });
  }

  // Profissionais endpoints
  async getProfissionais() {
    return this.request<ProfissionalResponse[]>('/profissionais');
  }

  // Estoque endpoints
  async getEstoque() {
    return this.request<EstoqueResponse[]>('/estoque');
  }

  async getEstoqueItem(id: string) {
    return this.request<EstoqueResponse>(`/estoque/${id}`);
  }

  async createEstoqueItem(data: EstoqueCreateRequest) {
    return this.request<EstoqueResponse>('/estoque', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEstoqueItem(id: string, data: EstoqueCreateRequest) {
    return this.request<EstoqueResponse>(`/estoque/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getEstoqueBaixo() {
    return this.request<EstoqueResponse[]>('/estoque/alertas/baixo');
  }

  async searchEstoque(termo: string) {
    return this.request<EstoqueResponse[]>(`/estoque/buscar?termo=${encodeURIComponent(termo)}`);
  }

  // Históricos endpoints
  async getHistoricos() {
    return this.request<HistoricoResponse[]>('/historicos');
  }

  async getHistoricosByPaciente(pacienteId: string) {
    return this.request<HistoricoResponse[]>(`/historicos/paciente/${pacienteId}`);
  }

  // Profissionais endpoints
  async getProfissionais() {
    return this.request<ProfissionalResponse[]>('/profissionais');
  }

  // Secretários endpoints
  async getSecretarios() {
    return this.request<SecretarioResponse[]>('/secretarios');
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Types
export interface LoginResponse {
  token: string;
  type: string;
  usuario: UsuarioResponse;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
  tipo: 'ADMIN' | 'PROFISSIONAL' | 'SECRETARIO';
  dataNascimento: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  tipo: 'ADMIN' | 'PROFISSIONAL' | 'SECRETARIO';
  dataNascimento: string;
  especialidade?: string;
  crm?: string;
}

export interface PacienteResponse {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  dataNascimento: string;
  idade: number;
  createdAt: string;
  updatedAt: string;
}

export interface PacienteCreateRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  dataNascimento: string;
}

export interface ConsultaResponse {
  id: string;
  paciente: PacienteResponse;
  profissional: ProfissionalResponse;
  dataHora: string;
  duracaoMinutos: number;
  observacoes?: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'REALIZADA';
  valor?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultaCreateRequest {
  pacienteId: string;
  profissionalId: string;
  dataHora: string;
  duracaoMinutos: number;
  observacoes?: string;
  valor?: number;
}

export interface EstoqueResponse {
  id: string;
  nome: string;
  descricao?: string;
  codigo: string;
  quantidade: number;
  unidade: string;
  valorUnitario?: number;
  minAlerta: number;
  categoria?: string;
  ativo: boolean;
  estoqueBaixo: boolean;
  esgotado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EstoqueCreateRequest {
  nome: string;
  descricao?: string;
  codigo: string;
  quantidade: number;
  unidade: string;
  valorUnitario?: number;
  minAlerta: number;
  categoria?: string;
}

export interface HistoricoResponse {
  id: string;
  paciente: PacienteResponse;
  profissional: ProfissionalResponse;
  descricao: string;
  diagnostico?: string;
  prescricao?: string;
  dataConsulta: string;
  createdAt: string;
}

export interface ProfissionalResponse {
  id: string;
  especialidade: string;
  crm: string;
  usuario: UsuarioResponse;
  createdAt: string;
}

export interface SecretarioResponse {
  id: string;
  usuario: UsuarioResponse;
  profissionais: {
    id: string;
    profissional: ProfissionalResponse;
  }[];
  createdAt: string;
}