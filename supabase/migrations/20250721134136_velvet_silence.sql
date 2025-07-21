/*
# DoctorPlus - Schema Completo do Sistema Médico

1. Novas Tabelas
   - `usuarios` - Usuários do sistema (médicos, secretários, admins)
   - `pacientes` - Cadastro de pacientes
   - `profissionais` - Informações específicas dos profissionais
   - `secretarios` - Cadastro de secretários
   - `secretario_profissionais` - Relacionamento N:N entre secretários e profissionais
   - `historicos` - Histórico médico dos pacientes
   - `arquivos` - Arquivos anexados aos históricos
   - `consultas` - Agendamentos de consultas
   - `estoque` - Controle de estoque de medicamentos/produtos
   - `receitas` - Receitas médicas emitidas

2. Segurança
   - RLS habilitado em todas as tabelas
   - Políticas específicas por tipo de usuário
   - Autenticação via Supabase Auth

3. Funcionalidades
   - Sistema completo de gestão clínica
   - Controle de acesso baseado em perfis
   - Histórico médico completo
   - Sistema de agendamentos
   - Controle de estoque
*/

-- Enum para tipos de usuário
CREATE TYPE tipo_usuario AS ENUM ('ADMIN', 'PROFISSIONAL', 'SECRETARIO');
CREATE TYPE status_consulta AS ENUM ('AGENDADA', 'CONFIRMADA', 'CANCELADA', 'REALIZADA');

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  tipo tipo_usuario NOT NULL,
  oauth_id text UNIQUE,
  data_nascimento date NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text UNIQUE NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  endereco text NOT NULL,
  data_nascimento date NOT NULL,
  usuario_id uuid REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  especialidade text NOT NULL,
  crm text UNIQUE NOT NULL,
  usuario_id uuid UNIQUE REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

-- Tabela de secretários
CREATE TABLE IF NOT EXISTS secretarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid UNIQUE REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

-- Tabela de relacionamento secretário-profissional
CREATE TABLE IF NOT EXISTS secretario_profissionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secretario_id uuid REFERENCES secretarios(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(secretario_id, profissional_id)
);

-- Tabela de históricos médicos
CREATE TABLE IF NOT EXISTS historicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id),
  descricao text NOT NULL,
  diagnostico text,
  prescricao text,
  data_consulta timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  url text NOT NULL,
  tipo text NOT NULL,
  tamanho integer,
  historico_id uuid REFERENCES historicos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Tabela de consultas/agendamentos
CREATE TABLE IF NOT EXISTS consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id),
  data_hora timestamptz NOT NULL,
  duracao_minutos integer DEFAULT 60,
  observacoes text,
  status status_consulta DEFAULT 'AGENDADA',
  valor decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  codigo text UNIQUE NOT NULL,
  quantidade integer NOT NULL DEFAULT 0,
  unidade text NOT NULL DEFAULT 'UN',
  valor_unitario decimal(10,2),
  min_alerta integer DEFAULT 10,
  categoria text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES profissionais(id),
  consulta_id uuid REFERENCES consultas(id),
  medicamentos jsonb NOT NULL,
  observacoes text,
  valida_ate date,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE secretarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE secretario_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE historicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Usuários podem ver próprios dados"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar próprios dados"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Políticas RLS para pacientes
CREATE POLICY "Profissionais podem ver todos os pacientes"
  ON pacientes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL', 'SECRETARIO')
    )
  );

CREATE POLICY "Profissionais podem criar pacientes"
  ON pacientes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL', 'SECRETARIO')
    )
  );

-- Políticas similares para outras tabelas
CREATE POLICY "Acesso geral para profissionais"
  ON profissionais FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL')
    )
  );

CREATE POLICY "Acesso geral para secretários"
  ON secretarios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'SECRETARIO')
    )
  );

CREATE POLICY "Acesso geral para históricos"
  ON historicos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL', 'SECRETARIO')
    )
  );

CREATE POLICY "Acesso geral para consultas"
  ON consultas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL', 'SECRETARIO')
    )
  );

CREATE POLICY "Acesso geral para estoque"
  ON estoque FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL', 'SECRETARIO')
    )
  );

CREATE POLICY "Acesso geral para receitas"
  ON receitas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id::text = auth.uid()::text 
      AND u.tipo IN ('ADMIN', 'PROFISSIONAL')
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historicos_paciente_id ON historicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_profissional_id ON consultas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_consultas_data_hora ON consultas(data_hora);
CREATE INDEX IF NOT EXISTS idx_estoque_categoria ON estoque(categoria);
CREATE INDEX IF NOT EXISTS idx_estoque_quantidade ON estoque(quantidade);