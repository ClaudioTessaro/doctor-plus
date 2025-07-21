import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'ADMIN' | 'PROFISSIONAL' | 'SECRETARIO';
  oauth_id?: string;
  data_nascimento: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  data_nascimento: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profissional {
  id: string;
  especialidade: string;
  crm: string;
  usuario_id: string;
  usuario?: Usuario;
  created_at: string;
}

export interface Consulta {
  id: string;
  paciente_id: string;
  profissional_id: string;
  data_hora: string;
  duracao_minutos: number;
  observacoes?: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'REALIZADA';
  valor?: number;
  paciente?: Paciente;
  profissional?: Profissional;
  created_at: string;
  updated_at: string;
}

export interface Historico {
  id: string;
  paciente_id: string;
  profissional_id: string;
  descricao: string;
  diagnostico?: string;
  prescricao?: string;
  data_consulta: string;
  paciente?: Paciente;
  profissional?: Profissional;
  created_at: string;
}

export interface EstoqueItem {
  id: string;
  nome: string;
  descricao?: string;
  codigo: string;
  quantidade: number;
  unidade: string;
  valor_unitario?: number;
  min_alerta: number;
  categoria?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}