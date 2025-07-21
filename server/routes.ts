import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPacienteSchema, insertProfissionalSchema, insertSecretarioSchema, 
         insertConsultaSchema, insertEstoqueSchema, insertHistoricoSchema } from "@shared/medical-schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.senha !== senha) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      if (!user.ativo) {
        return res.status(401).json({ message: "Usuário inativo" });
      }

      // In production, use proper JWT tokens
      const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
      
      res.json({
        token,
        type: "Bearer",
        usuario: user
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Check age requirement (18+)
      const birthDate = new Date(userData.dataNascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        return res.status(400).json({ message: "Usuário deve ser maior de 18 anos" });
      }

      const user = await storage.createUser(userData);
      
      // If user is a professional, create professional record
      if (userData.tipo === "PROFISSIONAL") {
        if (!req.body.especialidade || !req.body.crm) {
          return res.status(400).json({ message: "Especialidade e CRM são obrigatórios para profissionais" });
        }
        
        await storage.createProfissional({
          usuarioId: user.id,
          especialidade: req.body.especialidade,
          crm: req.body.crm
        });
      }

      res.status(201).json(user);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Patients routes
  app.get("/api/pacientes", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      
      const result = await storage.getPacientes(page, size);
      
      res.json({
        content: result.content,
        page,
        size,
        totalElements: result.total,
        totalPages: Math.ceil(result.total / size),
        first: page === 0,
        last: page >= Math.ceil(result.total / size) - 1,
        empty: result.content.length === 0
      });
    } catch (error) {
      console.error("Get pacientes error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/pacientes/simples", async (req, res) => {
    try {
      const result = await storage.getPacientes(0, 1000);
      res.json(result.content.map(p => ({ id: p.id, nome: p.nome, cpf: p.cpf, email: p.email })));
    } catch (error) {
      console.error("Get pacientes simples error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/pacientes/buscar", async (req, res) => {
    try {
      const termo = req.query.termo as string;
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      
      if (!termo) {
        return res.status(400).json({ message: "Termo de busca é obrigatório" });
      }

      const result = await storage.searchPacientes(termo, page, size);
      
      res.json({
        content: result.content,
        page,
        size,
        totalElements: result.total,
        totalPages: Math.ceil(result.total / size),
        first: page === 0,
        last: page >= Math.ceil(result.total / size) - 1,
        empty: result.content.length === 0
      });
    } catch (error) {
      console.error("Search pacientes error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/pacientes", async (req, res) => {
    try {
      const pacienteData = insertPacienteSchema.parse(req.body);
      const paciente = await storage.createPaciente(pacienteData);
      res.status(201).json(paciente);
    } catch (error: any) {
      console.error("Create paciente error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/pacientes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const pacienteData = insertPacienteSchema.partial().parse(req.body);
      const paciente = await storage.updatePaciente(id, pacienteData);
      
      if (!paciente) {
        return res.status(404).json({ message: "Paciente não encontrado" });
      }
      
      res.json(paciente);
    } catch (error: any) {
      console.error("Update paciente error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/pacientes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePaciente(id);
      
      if (!success) {
        return res.status(404).json({ message: "Paciente não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete paciente error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Professionals routes
  app.get("/api/profissionais", async (req, res) => {
    try {
      const profissionais = await storage.getProfissionais();
      
      // Fetch user data for each professional
      const profissionaisWithUsers = await Promise.all(
        profissionais.map(async (prof) => {
          const usuario = await storage.getUser(prof.usuarioId);
          return { ...prof, usuario };
        })
      );
      
      res.json(profissionaisWithUsers.filter(p => p.usuario));
    } catch (error) {
      console.error("Get profissionais error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Consultations routes
  app.get("/api/consultas/proximas", async (req, res) => {
    try {
      const consultas = await storage.getConsultas();
      
      // Fetch related data for each consultation
      const consultasWithData = await Promise.all(
        consultas.slice(0, 10).map(async (consulta) => {
          const [paciente, profissional] = await Promise.all([
            storage.getPaciente(consulta.pacienteId),
            storage.getProfissional(consulta.profissionalId)
          ]);
          
          if (paciente && profissional) {
            const profissionalUser = await storage.getUser(profissional.usuarioId);
            return {
              ...consulta,
              paciente,
              profissional: { ...profissional, usuario: profissionalUser }
            };
          }
          return null;
        })
      );
      
      res.json(consultasWithData.filter(Boolean));
    } catch (error) {
      console.error("Get consultas error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/consultas/periodo", async (req, res) => {
    try {
      const inicio = new Date(req.query.inicio as string);
      const fim = new Date(req.query.fim as string);
      
      const consultas = await storage.getConsultasByPeriodo(inicio, fim);
      
      // Fetch related data for each consultation
      const consultasWithData = await Promise.all(
        consultas.map(async (consulta) => {
          const [paciente, profissional] = await Promise.all([
            storage.getPaciente(consulta.pacienteId),
            storage.getProfissional(consulta.profissionalId)
          ]);
          
          if (paciente && profissional) {
            const profissionalUser = await storage.getUser(profissional.usuarioId);
            return {
              ...consulta,
              paciente,
              profissional: { ...profissional, usuario: profissionalUser }
            };
          }
          return null;
        })
      );
      
      res.json(consultasWithData.filter(Boolean));
    } catch (error) {
      console.error("Get consultas by period error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/consultas", async (req, res) => {
    try {
      const consultaData = insertConsultaSchema.parse(req.body);
      const consulta = await storage.createConsulta(consultaData);
      
      // Fetch related data for response
      const [paciente, profissional] = await Promise.all([
        storage.getPaciente(consulta.pacienteId),
        storage.getProfissional(consulta.profissionalId)
      ]);
      
      if (paciente && profissional) {
        const profissionalUser = await storage.getUser(profissional.usuarioId);
        res.status(201).json({
          ...consulta,
          paciente,
          profissional: { ...profissional, usuario: profissionalUser }
        });
      } else {
        res.status(201).json(consulta);
      }
    } catch (error: any) {
      console.error("Create consulta error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Stock routes
  app.get("/api/estoque", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      
      const result = await storage.getEstoque(page, size);
      
      // Add computed fields
      const contentWithComputed = result.content.map(item => ({
        ...item,
        estoqueBaixo: item.quantidade <= item.minAlerta,
        esgotado: item.quantidade === 0
      }));
      
      res.json({
        content: contentWithComputed,
        page,
        size,
        totalElements: result.total,
        totalPages: Math.ceil(result.total / size),
        first: page === 0,
        last: page >= Math.ceil(result.total / size) - 1,
        empty: result.content.length === 0
      });
    } catch (error) {
      console.error("Get estoque error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/estoque", async (req, res) => {
    try {
      const estoqueData = insertEstoqueSchema.parse(req.body);
      const item = await storage.createEstoqueItem(estoqueData);
      
      const itemWithComputed = {
        ...item,
        estoqueBaixo: item.quantidade <= item.minAlerta,
        esgotado: item.quantidade === 0
      };
      
      res.status(201).json(itemWithComputed);
    } catch (error: any) {
      console.error("Create estoque error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Medical records routes
  app.get("/api/historicos", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      
      const result = await storage.getHistoricos(page, size);
      
      // Fetch related data
      const historicosWithData = await Promise.all(
        result.content.map(async (historico) => {
          const [paciente, profissional] = await Promise.all([
            storage.getPaciente(historico.pacienteId),
            storage.getProfissional(historico.profissionalId)
          ]);
          
          if (paciente && profissional) {
            const profissionalUser = await storage.getUser(profissional.usuarioId);
            return {
              ...historico,
              paciente,
              profissional: { ...profissional, usuario: profissionalUser }
            };
          }
          return null;
        })
      );
      
      res.json({
        content: historicosWithData.filter(Boolean),
        page,
        size,
        totalElements: result.total,
        totalPages: Math.ceil(result.total / size),
        first: page === 0,
        last: page >= Math.ceil(result.total / size) - 1,
        empty: result.content.length === 0
      });
    } catch (error) {
      console.error("Get historicos error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/historicos", async (req, res) => {
    try {
      const historicoData = insertHistoricoSchema.parse(req.body);
      const historico = await storage.createHistorico(historicoData);
      
      // Fetch related data for response
      const [paciente, profissional] = await Promise.all([
        storage.getPaciente(historico.pacienteId),
        storage.getProfissional(historico.profissionalId)
      ]);
      
      if (paciente && profissional) {
        const profissionalUser = await storage.getUser(profissional.usuarioId);
        res.status(201).json({
          ...historico,
          paciente,
          profissional: { ...profissional, usuario: profissionalUser }
        });
      } else {
        res.status(201).json(historico);
      }
    } catch (error: any) {
      console.error("Create historico error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Secretaries routes
  app.get("/api/secretarios", async (req, res) => {
    try {
      const secretarios = await storage.getSecretarios();
      
      // Fetch user data for each secretary
      const secretariosWithUsers = await Promise.all(
        secretarios.map(async (sec) => {
          const usuario = await storage.getUser(sec.usuarioId);
          let profissional = null;
          if (sec.profissionalId) {
            profissional = await storage.getProfissional(sec.profissionalId);
            if (profissional) {
              const profUser = await storage.getUser(profissional.usuarioId);
              profissional = { ...profissional, usuario: profUser };
            }
          }
          return { ...sec, usuario, profissional };
        })
      );
      
      res.json(secretariosWithUsers.filter(s => s.usuario));
    } catch (error) {
      console.error("Get secretarios error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
