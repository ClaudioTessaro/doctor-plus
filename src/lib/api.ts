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
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            message: `Erro de comunicação com o servidor (${response.status})`,
            error: `Erro HTTP ${response.status}`,
            status: response.status
          };
        }
        console.error('API Error:', response.status, errorData);
        
        // Sistema aprimorado de extração de mensagens
        let errorMessage = 'Ocorreu um erro inesperado';
        let errorTitle = 'Erro';
        let errorDescription = '';
        
        if (errorData.message) {
          errorMessage = errorData.message;
          errorDescription = errorData.path ? `Endpoint: ${errorData.path}` : '';
        } else if (errorData.validationErrors) {
          // Para erros de validação, mostrar todos os erros
          const errors = Object.entries(errorData.validationErrors);
          errorMessage = 'Dados inválidos fornecidos';
          errorDescription = errors.map(([field, msg]) => `${field}: ${msg}`).join('\n');
        } else if (errorData.error && errorData.error !== errorData.message) {
          errorMessage = errorData.error;
        }
        
        // Definir título baseado no status
        switch (response.status) {
          case 400:
            errorTitle = 'Dados Inválidos';
            break;
          case 401:
            errorTitle = 'Não Autorizado';
            break;
          case 403:
            errorTitle = 'Acesso Negado';
            break;
          case 404:
            errorTitle = 'Não Encontrado';
            break;
          case 409:
            errorTitle = 'Conflito';
            break;
          case 500:
            errorTitle = 'Erro do Servidor';
            break;
          default:
            errorTitle = errorData.error || 'Erro';
        }
        
        if (errorData.error && typeof errorData.error === 'string' && !errorTitle.includes('Erro')) {
          errorTitle = errorData.error;
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).title = errorTitle;
        (error as any).description = errorDescription;
        (error as any).validationErrors = errorData.validationErrors;
        (error as any).originalError = errorData;
        throw error;
      }

      // Verificar se há conteúdo para fazer parse
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = null;
      }
      
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
  async getPacientes(page = 0, size = 20, sortBy = 'nome', sortDir = 'asc') {
    return this.request<PageResponse<PacienteResponse>>(`/pacientes?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  }

  async getPacientesSimples() {
    return this.request<PacienteResponse[]>('/pacientes/simples');
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
    return this.request<PageResponse<PacienteResponse>>(`/pacientes/buscar?termo=${encodeURIComponent(termo)}`);
  }

  async searchPacientesPaginated(termo: string, page = 0, size = 20) {
    return this.request<PageResponse<PacienteResponse>>(`/pacientes/buscar?termo=${encodeURIComponent(termo)}&page=${page}&size=${size}`);
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

  async realizarConsulta(id: string) {
    return this.request(`/consultas/${id}/realizar`, {
      method: 'PATCH',
    });
  }

  async alterarStatusConsulta(id: string, status: string) {
    return this.request<ConsultaResponse>(`/consultas/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  // Profissionais endpoints
  async getProfissionais() {
    return this.request<ProfissionalResponse[]>('/profissionais');
  }

  async getProfissional(id: string) {
    return this.request<ProfissionalResponse>(`/profissionais/${id}`);
  }

  async searchProfissionais(termo: string) {
    return this.request<ProfissionalResponse[]>(`/profissionais/buscar?termo=${encodeURIComponent(termo)}`);
  }

  async getProfissionaisByEspecialidade(especialidade: string) {
    return this.request<ProfissionalResponse[]>(`/profissionais/especialidade/${especialidade}`);
  }

  async getEspecialidades() {
    return this.request<string[]>('/profissionais/especialidades');
  }

  // Estoque endpoints
  async getEstoque(page = 0, size = 20, sortBy = 'nome', sortDir = 'asc') {
    return this.request<PageResponse<EstoqueResponse>>(`/estoque?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  }

  async getEstoqueSimples() {
    return this.request<EstoqueResponse[]>('/estoque/simples');
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

  async ajustarQuantidadeEstoque(id: string, quantidade: number) {
    return this.request<EstoqueResponse>(`/estoque/${id}/quantidade?quantidade=${quantidade}`, {
      method: 'PATCH',
    });
  }

  async adicionarQuantidadeEstoque(id: string, quantidade: number) {
    return this.request<EstoqueResponse>(`/estoque/${id}/adicionar?quantidade=${quantidade}`, {
      method: 'PATCH',
    });
  }

  async removerQuantidadeEstoque(id: string, quantidade: number) {
    return this.request<EstoqueResponse>(`/estoque/${id}/remover?quantidade=${quantidade}`, {
      method: 'PATCH',
    });
  }

  async desativarEstoqueItem(id: string) {
    return this.request(`/estoque/${id}/desativar`, {
      method: 'PATCH',
    });
  }

  async getEstoqueBaixo() {
    return this.request<EstoqueResponse[]>('/estoque/alertas/baixo');
  }

  async searchEstoque(termo: string) {
    return this.request<PageResponse<EstoqueResponse>>(`/estoque/buscar?termo=${encodeURIComponent(termo)}`);
  }

  async searchEstoquePaginated(termo: string, page = 0, size = 20) {
    return this.request<PageResponse<EstoqueResponse>>(`/estoque/buscar?termo=${encodeURIComponent(termo)}&page=${page}&size=${size}`);
  }

  // Históricos endpoints
  async getHistoricos(page = 0, size = 20, sortBy = 'dataConsulta', sortDir = 'desc') {
    return this.request<PageResponse<HistoricoResponse>>(`/historicos?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  }

  async getHistoricosSimples() {
    return this.request<HistoricoResponse[]>('/historicos/simples');
  }

  async createHistorico(data: HistoricoCreateRequest) {
    return this.request<HistoricoResponse>('/historicos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


  async updateHistorico(id: string, data: HistoricoCreateRequest) {
    return this.request<HistoricoResponse>(`/historicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHistorico(id: string) {
    return this.request(`/historicos/${id}`, {
      method: 'DELETE',
    });
  }

  async getHistoricosByPaciente(pacienteId: string) {
    return this.request<HistoricoResponse[]>(`/historicos/paciente/${pacienteId}`);
  }

  async searchHistoricos(termo: string) {
    return this.request<PageResponse<HistoricoResponse>>(`/historicos/buscar?termo=${encodeURIComponent(termo)}`);
  }

  async searchHistoricosPaginated(termo: string, page = 0, size = 20) {
    return this.request<PageResponse<HistoricoResponse>>(`/historicos/buscar?termo=${encodeURIComponent(termo)}&page=${page}&size=${size}`);
  }

  // Secretários endpoints
  async getSecretarios() {
    return this.request<SecretarioResponse[]>('/secretarios');
  }

  async getSecretario(id: string) {
    return this.request<SecretarioResponse>(`/secretarios/${id}`);
  }

  async createSecretario(data: SecretarioCreateRequest) {
    return this.request<SecretarioResponse>('/secretarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSecretario(id: string, data: SecretarioCreateRequest) {
    return this.request<SecretarioResponse>(`/secretarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async vincularProfissional(secretarioId: string, profissionalId: string) {
    return this.request<SecretarioResponse>(`/secretarios/${secretarioId}/vincular/${profissionalId}`, {
      method: 'POST',
    });
  }

  async desvincularProfissional(secretarioId: string, profissionalId: string) {
    return this.request(`/secretarios/${secretarioId}/desvincular/${profissionalId}`, {
      method: 'DELETE',
    });
  }

  async ativarSecretario(id: string) {
    return this.request(`/secretarios/${id}/ativar`, {
      method: 'PATCH',
    });
  }

  async desativarSecretario(id: string) {
    return this.request(`/secretarios/${id}/desativar`, {
      method: 'PATCH',
    });
  }

  async searchSecretarios(termo: string) {
    return this.request<SecretarioResponse[]>(`/secretarios/buscar?termo=${encodeURIComponent(termo)}`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<DashboardStatsResponse>('/dashboard/stats');
  }

  async getPacienteStats() {
    return this.request<DashboardStatsResponse['PacienteStats']>('/dashboard/stats/pacientes');
  }

  async getConsultaStats() {
    return this.request<DashboardStatsResponse['ConsultaStats']>('/dashboard/stats/consultas');
  }

  async getFinanceiroStats() {
    return this.request<DashboardStatsResponse['FinanceiroStats']>('/dashboard/stats/financeiro');
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Types
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

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

export interface HistoricoCreateRequest {
  pacienteId: string;
  descricao: string;
  diagnostico?: string;
  prescricao?: string;
  dataConsulta: string;
}

export interface ProfissionalResponse {
  id: string;
  especialidade: string;
  crm: string;
  usuario: UsuarioResponse;
  createdAt: string;
}

export interface SecretarioCreateRequest {
  nome: string;
  email: string;
  senha?: string;
  dataNascimento: string;
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

export interface DashboardStatsResponse {
  totalPacientes: number;
  totalProfissionais: number;
  totalSecretarios: number;
  totalHistoricos: number;
  consultasHoje: number;
  consultasSemana: number;
  consultasMes: number;
  consultasAgendadas: number;
  consultasConfirmadas: number;
  consultasRealizadas: number;
  itensEstoque: number;
  itensEstoqueBaixo: number;
  itensEsgotados: number;
  pacientesNovosHoje: number;
  pacientesNovosSemana: number;
  receitaMes: number;
  PacienteStats: {
    total: number;
    novosMes: number;
    crescimentoMensal: number;
  };
  ConsultaStats: {
    totalMes: number;
    agendadas: number;
    confirmadas: number;
    realizadas: number;
    canceladas: number;
    taxaRealizacao: number;
  };
  FinanceiroStats: {
    receitaMes: number;
    receitaHoje: number;
    crescimentoMensal: number;
    ticketMedio: number;
  };
}