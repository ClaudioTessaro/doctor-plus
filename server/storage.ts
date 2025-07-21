import { 
  users, pacientes, profissionais, secretarios, consultas, estoque, historicos,
  type User, type InsertUser, type Paciente, type InsertPaciente,
  type Profissional, type InsertProfissional, type Secretario, type InsertSecretario,
  type Consulta, type InsertConsulta, type Estoque, type InsertEstoque,
  type Historico, type InsertHistorico
} from "@shared/medical-schema";

// Medical clinic storage interface
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Paciente operations
  getPacientes(page: number, size: number): Promise<{ content: Paciente[], total: number }>;
  getPaciente(id: string): Promise<Paciente | undefined>;
  createPaciente(paciente: InsertPaciente): Promise<Paciente>;
  updatePaciente(id: string, paciente: Partial<InsertPaciente>): Promise<Paciente | undefined>;
  deletePaciente(id: string): Promise<boolean>;
  searchPacientes(termo: string, page: number, size: number): Promise<{ content: Paciente[], total: number }>;
  
  // Profissional operations
  getProfissionais(): Promise<Profissional[]>;
  getProfissional(id: string): Promise<Profissional | undefined>;
  createProfissional(profissional: InsertProfissional): Promise<Profissional>;
  updateProfissional(id: string, profissional: Partial<InsertProfissional>): Promise<Profissional | undefined>;
  
  // Secretario operations
  getSecretarios(): Promise<Secretario[]>;
  createSecretario(secretario: InsertSecretario): Promise<Secretario>;
  updateSecretario(id: string, secretario: Partial<InsertSecretario>): Promise<Secretario | undefined>;
  vincularProfissional(secretarioId: string, profissionalId: string): Promise<Secretario | undefined>;
  
  // Consulta operations
  getConsultas(): Promise<Consulta[]>;
  getConsultasByPeriodo(inicio: Date, fim: Date): Promise<Consulta[]>;
  getConsultasByPaciente(pacienteId: string): Promise<Consulta[]>;
  createConsulta(consulta: InsertConsulta): Promise<Consulta>;
  updateConsulta(id: string, consulta: Partial<InsertConsulta>): Promise<Consulta | undefined>;
  deleteConsulta(id: string): Promise<boolean>;
  
  // Estoque operations
  getEstoque(page: number, size: number): Promise<{ content: Estoque[], total: number }>;
  getEstoqueItem(id: string): Promise<Estoque | undefined>;
  createEstoqueItem(item: InsertEstoque): Promise<Estoque>;
  updateEstoqueItem(id: string, item: Partial<InsertEstoque>): Promise<Estoque | undefined>;
  deleteEstoqueItem(id: string): Promise<boolean>;
  searchEstoque(termo: string, page: number, size: number): Promise<{ content: Estoque[], total: number }>;
  ajustarQuantidade(id: string, quantidade: number, motivo: string): Promise<Estoque | undefined>;
  
  // Historico operations
  getHistoricos(page: number, size: number): Promise<{ content: Historico[], total: number }>;
  getHistoricosByPaciente(pacienteId: string): Promise<Historico[]>;
  createHistorico(historico: InsertHistorico): Promise<Historico>;
  updateHistorico(id: string, historico: Partial<InsertHistorico>): Promise<Historico | undefined>;
  deleteHistorico(id: string): Promise<boolean>;
  searchHistoricos(termo: string, page: number, size: number): Promise<{ content: Historico[], total: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private pacientes: Map<string, Paciente> = new Map();
  private profissionais: Map<string, Profissional> = new Map();
  private secretarios: Map<string, Secretario> = new Map();
  private consultas: Map<string, Consulta> = new Map();
  private estoque: Map<string, Estoque> = new Map();
  private historicos: Map<string, Historico> = new Map();
  
  constructor() {
    this.seedData();
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
  
  private seedData() {
    // Create admin user
    const adminId = this.generateId();
    const admin: User = {
      id: adminId,
      nome: "Administrador",
      email: "admin@doctorplus.com",
      senha: "admin123", // In production, this should be hashed
      tipo: "ADMIN",
      dataNascimento: new Date("1980-01-01"),
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create a professional user
    const profId = this.generateId();
    const profUser: User = {
      id: profId,
      nome: "Dr. João Silva",
      email: "joao@doctorplus.com", 
      senha: "prof123",
      tipo: "PROFISSIONAL",
      dataNascimento: new Date("1985-05-15"),
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(profId, profUser);
    
    const profissional: Profissional = {
      id: this.generateId(),
      usuarioId: profId,
      especialidade: "Clínico Geral",
      crm: "12345-SP",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profissionais.set(profissional.id, profissional);

    // Create sample patient
    const pacienteId = this.generateId();
    const paciente: Paciente = {
      id: pacienteId,
      nome: "Maria Santos",
      cpf: "123.456.789-00",
      email: "maria@email.com",
      telefone: "(11) 99999-9999",
      endereco: "Rua das Flores, 123 - São Paulo, SP",
      dataNascimento: new Date("1990-03-20"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pacientes.set(pacienteId, paciente);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.generateId();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated: User = { ...user, ...updateUser, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Paciente operations
  async getPacientes(page: number, size: number): Promise<{ content: Paciente[], total: number }> {
    const all = Array.from(this.pacientes.values());
    const start = page * size;
    const content = all.slice(start, start + size);
    return { content, total: all.length };
  }

  async getPaciente(id: string): Promise<Paciente | undefined> {
    return this.pacientes.get(id);
  }

  async createPaciente(insertPaciente: InsertPaciente): Promise<Paciente> {
    const id = this.generateId();
    const paciente: Paciente = {
      ...insertPaciente,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pacientes.set(id, paciente);
    return paciente;
  }

  async updatePaciente(id: string, updatePaciente: Partial<InsertPaciente>): Promise<Paciente | undefined> {
    const paciente = this.pacientes.get(id);
    if (!paciente) return undefined;
    
    const updated: Paciente = { ...paciente, ...updatePaciente, updatedAt: new Date() };
    this.pacientes.set(id, updated);
    return updated;
  }

  async deletePaciente(id: string): Promise<boolean> {
    return this.pacientes.delete(id);
  }

  async searchPacientes(termo: string, page: number, size: number): Promise<{ content: Paciente[], total: number }> {
    const filtered = Array.from(this.pacientes.values()).filter(p => 
      p.nome.toLowerCase().includes(termo.toLowerCase()) ||
      p.cpf.includes(termo) ||
      p.email.toLowerCase().includes(termo.toLowerCase())
    );
    const start = page * size;
    const content = filtered.slice(start, start + size);
    return { content, total: filtered.length };
  }

  // Profissional operations
  async getProfissionais(): Promise<Profissional[]> {
    return Array.from(this.profissionais.values());
  }

  async getProfissional(id: string): Promise<Profissional | undefined> {
    return this.profissionais.get(id);
  }

  async createProfissional(insertProfissional: InsertProfissional): Promise<Profissional> {
    const id = this.generateId();
    const profissional: Profissional = {
      ...insertProfissional,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profissionais.set(id, profissional);
    return profissional;
  }

  async updateProfissional(id: string, updateProfissional: Partial<InsertProfissional>): Promise<Profissional | undefined> {
    const profissional = this.profissionais.get(id);
    if (!profissional) return undefined;
    
    const updated: Profissional = { ...profissional, ...updateProfissional, updatedAt: new Date() };
    this.profissionais.set(id, updated);
    return updated;
  }

  // Secretario operations
  async getSecretarios(): Promise<Secretario[]> {
    return Array.from(this.secretarios.values());
  }

  async createSecretario(insertSecretario: InsertSecretario): Promise<Secretario> {
    const id = this.generateId();
    const secretario: Secretario = {
      ...insertSecretario,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.secretarios.set(id, secretario);
    return secretario;
  }

  async updateSecretario(id: string, updateSecretario: Partial<InsertSecretario>): Promise<Secretario | undefined> {
    const secretario = this.secretarios.get(id);
    if (!secretario) return undefined;
    
    const updated: Secretario = { ...secretario, ...updateSecretario, updatedAt: new Date() };
    this.secretarios.set(id, updated);
    return updated;
  }

  async vincularProfissional(secretarioId: string, profissionalId: string): Promise<Secretario | undefined> {
    return this.updateSecretario(secretarioId, { profissionalId });
  }

  // Consulta operations
  async getConsultas(): Promise<Consulta[]> {
    return Array.from(this.consultas.values()).sort((a, b) => 
      new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    );
  }

  async getConsultasByPeriodo(inicio: Date, fim: Date): Promise<Consulta[]> {
    return Array.from(this.consultas.values()).filter(c => {
      const dataConsulta = new Date(c.dataHora);
      return dataConsulta >= inicio && dataConsulta <= fim;
    });
  }

  async getConsultasByPaciente(pacienteId: string): Promise<Consulta[]> {
    return Array.from(this.consultas.values()).filter(c => c.pacienteId === pacienteId);
  }

  async createConsulta(insertConsulta: InsertConsulta): Promise<Consulta> {
    const id = this.generateId();
    const consulta: Consulta = {
      ...insertConsulta,
      id,
      status: "AGENDADA",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.consultas.set(id, consulta);
    return consulta;
  }

  async updateConsulta(id: string, updateConsulta: Partial<InsertConsulta>): Promise<Consulta | undefined> {
    const consulta = this.consultas.get(id);
    if (!consulta) return undefined;
    
    const updated: Consulta = { ...consulta, ...updateConsulta, updatedAt: new Date() };
    this.consultas.set(id, updated);
    return updated;
  }

  async deleteConsulta(id: string): Promise<boolean> {
    return this.consultas.delete(id);
  }

  // Estoque operations
  async getEstoque(page: number, size: number): Promise<{ content: Estoque[], total: number }> {
    const all = Array.from(this.estoque.values()).filter(item => item.ativo);
    const start = page * size;
    const content = all.slice(start, start + size);
    return { content, total: all.length };
  }

  async getEstoqueItem(id: string): Promise<Estoque | undefined> {
    return this.estoque.get(id);
  }

  async createEstoqueItem(insertEstoque: InsertEstoque): Promise<Estoque> {
    const id = this.generateId();
    const item: Estoque = {
      ...insertEstoque,
      id,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.estoque.set(id, item);
    return item;
  }

  async updateEstoqueItem(id: string, updateEstoque: Partial<InsertEstoque>): Promise<Estoque | undefined> {
    const item = this.estoque.get(id);
    if (!item) return undefined;
    
    const updated: Estoque = { ...item, ...updateEstoque, updatedAt: new Date() };
    this.estoque.set(id, updated);
    return updated;
  }

  async deleteEstoqueItem(id: string): Promise<boolean> {
    const item = this.estoque.get(id);
    if (!item) return false;
    
    const updated: Estoque = { ...item, ativo: false, updatedAt: new Date() };
    this.estoque.set(id, updated);
    return true;
  }

  async searchEstoque(termo: string, page: number, size: number): Promise<{ content: Estoque[], total: number }> {
    const filtered = Array.from(this.estoque.values()).filter(item => 
      item.ativo && (
        item.nome.toLowerCase().includes(termo.toLowerCase()) ||
        item.codigo.toLowerCase().includes(termo.toLowerCase()) ||
        (item.categoria && item.categoria.toLowerCase().includes(termo.toLowerCase()))
      )
    );
    const start = page * size;
    const content = filtered.slice(start, start + size);
    return { content, total: filtered.length };
  }

  async ajustarQuantidade(id: string, quantidade: number, motivo: string): Promise<Estoque | undefined> {
    return this.updateEstoqueItem(id, { quantidade });
  }

  // Historico operations
  async getHistoricos(page: number, size: number): Promise<{ content: Historico[], total: number }> {
    const all = Array.from(this.historicos.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const start = page * size;
    const content = all.slice(start, start + size);
    return { content, total: all.length };
  }

  async getHistoricosByPaciente(pacienteId: string): Promise<Historico[]> {
    return Array.from(this.historicos.values())
      .filter(h => h.pacienteId === pacienteId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createHistorico(insertHistorico: InsertHistorico): Promise<Historico> {
    const id = this.generateId();
    const historico: Historico = {
      ...insertHistorico,
      id,
      createdAt: new Date(),
    };
    this.historicos.set(id, historico);
    return historico;
  }

  async updateHistorico(id: string, updateHistorico: Partial<InsertHistorico>): Promise<Historico | undefined> {
    const historico = this.historicos.get(id);
    if (!historico) return undefined;
    
    const updated: Historico = { ...historico, ...updateHistorico };
    this.historicos.set(id, updated);
    return updated;
  }

  async deleteHistorico(id: string): Promise<boolean> {
    return this.historicos.delete(id);
  }

  async searchHistoricos(termo: string, page: number, size: number): Promise<{ content: Historico[], total: number }> {
    const filtered = Array.from(this.historicos.values()).filter(h => 
      h.descricao.toLowerCase().includes(termo.toLowerCase()) ||
      (h.diagnostico && h.diagnostico.toLowerCase().includes(termo.toLowerCase())) ||
      (h.prescricao && h.prescricao.toLowerCase().includes(termo.toLowerCase()))
    );
    const start = page * size;
    const content = filtered.slice(start, start + size);
    return { content, total: filtered.length };
  }
}

export const storage = new MemStorage();
