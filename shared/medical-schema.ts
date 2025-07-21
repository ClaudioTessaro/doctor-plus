import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userTypeEnum = pgEnum("user_type", ["ADMIN", "PROFISSIONAL", "SECRETARIO"]);
export const consultaStatusEnum = pgEnum("consulta_status", ["AGENDADA", "CONFIRMADA", "CANCELADA", "REALIZADA"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: text("senha").notNull(),
  tipo: userTypeEnum("tipo").notNull(),
  dataNascimento: timestamp("data_nascimento").notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professionals table
export const profissionais = pgTable("profissionais", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  especialidade: text("especialidade").notNull(),
  crm: varchar("crm", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Secretarios table
export const secretarios = pgTable("secretarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profissionalId: uuid("profissional_id").references(() => profissionais.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patients table
export const pacientes = pgTable("pacientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  endereco: text("endereco").notNull(),
  dataNascimento: timestamp("data_nascimento").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consultations table
export const consultas = pgTable("consultas", {
  id: uuid("id").primaryKey().defaultRandom(),
  pacienteId: uuid("paciente_id").notNull().references(() => pacientes.id, { onDelete: "cascade" }),
  profissionalId: uuid("profissional_id").notNull().references(() => profissionais.id, { onDelete: "cascade" }),
  dataHora: timestamp("data_hora").notNull(),
  duracaoMinutos: integer("duracao_minutos").notNull().default(60),
  observacoes: text("observacoes"),
  status: consultaStatusEnum("status").default("AGENDADA"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock table
export const estoque = pgTable("estoque", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  quantidade: integer("quantidade").notNull().default(0),
  unidade: varchar("unidade", { length: 20 }).notNull(),
  valorUnitario: decimal("valor_unitario", { precision: 10, scale: 2 }),
  minAlerta: integer("min_alerta").notNull().default(10),
  categoria: text("categoria"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical history table
export const historicos = pgTable("historicos", {
  id: uuid("id").primaryKey().defaultRandom(),
  pacienteId: uuid("paciente_id").notNull().references(() => pacientes.id, { onDelete: "cascade" }),
  profissionalId: uuid("profissional_id").notNull().references(() => profissionais.id, { onDelete: "cascade" }),
  descricao: text("descricao").notNull(),
  diagnostico: text("diagnostico"),
  prescricao: text("prescricao"),
  dataConsulta: timestamp("data_consulta").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfissionalSchema = createInsertSchema(profissionais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecretarioSchema = createInsertSchema(secretarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPacienteSchema = createInsertSchema(pacientes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsultaSchema = createInsertSchema(consultas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEstoqueSchema = createInsertSchema(estoque).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHistoricoSchema = createInsertSchema(historicos).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfissional = z.infer<typeof insertProfissionalSchema>;
export type Profissional = typeof profissionais.$inferSelect;

export type InsertSecretario = z.infer<typeof insertSecretarioSchema>;
export type Secretario = typeof secretarios.$inferSelect;

export type InsertPaciente = z.infer<typeof insertPacienteSchema>;
export type Paciente = typeof pacientes.$inferSelect;

export type InsertConsulta = z.infer<typeof insertConsultaSchema>;
export type Consulta = typeof consultas.$inferSelect;

export type InsertEstoque = z.infer<typeof insertEstoqueSchema>;
export type Estoque = typeof estoque.$inferSelect;

export type InsertHistorico = z.infer<typeof insertHistoricoSchema>;
export type Historico = typeof historicos.$inferSelect;