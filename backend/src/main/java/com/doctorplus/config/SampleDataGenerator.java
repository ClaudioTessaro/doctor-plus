package com.doctorplus.config;

import com.doctorplus.domain.entity.Consulta;
import com.doctorplus.domain.entity.Estoque;
import com.doctorplus.domain.entity.Historico;
import com.doctorplus.domain.entity.Paciente;
import com.doctorplus.domain.entity.Profissional;
import com.doctorplus.domain.entity.Usuario;
import com.doctorplus.domain.enums.StatusConsulta;
import com.doctorplus.domain.enums.TipoUsuario;
import com.doctorplus.repository.ConsultaRepository;
import com.doctorplus.repository.EstoqueRepository;
import com.doctorplus.repository.HistoricoRepository;
import com.doctorplus.repository.PacienteRepository;
import com.doctorplus.repository.ProfissionalRepository;
import com.doctorplus.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@Order(2) // Executa após o DataInitializer
public class SampleDataGenerator implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SampleDataGenerator.class);

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PacienteRepository pacienteRepository;
    
    @Autowired
    private ProfissionalRepository profissionalRepository;
    
    @Autowired
    private HistoricoRepository historicoRepository;
    
    @Autowired
    private EstoqueRepository estoqueRepository;
    
    @Autowired
    private ConsultaRepository consultaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        if (shouldGenerateSampleData()) {
            logger.info("Gerando dados de exemplo...");
            
            Usuario admin = getOrCreateAdmin();
            Profissional profissional = createSampleProfissional();
            
            createSamplePacientes(admin, 25);
            createSampleEstoque(30);
            createSampleHistoricos(profissional, 35);
            createSampleConsultas(profissional, 20);
            
            logger.info("Dados de exemplo gerados com sucesso!");
        }
    }

    private boolean shouldGenerateSampleData() {
        // Gera dados apenas se não existirem pacientes
        return pacienteRepository.count() == 0;
    }

    private Usuario getOrCreateAdmin() {
        return usuarioRepository.findByEmail("admin@doctorplus.com")
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));
    }

    private Profissional createSampleProfissional() {
        // Verifica se já existe um profissional
        List<Profissional> existingProfissionais = profissionalRepository.findAllAtivos();
        if (!existingProfissionais.isEmpty()) {
            return existingProfissionais.get(0);
        }

        // Criar usuário profissional
        Usuario usuario = new Usuario();
        usuario.setNome("Dr. João Silva");
        usuario.setEmail("joao.silva@doctorplus.com");
        usuario.setSenha(passwordEncoder.encode("123456"));
        usuario.setTipo(TipoUsuario.PROFISSIONAL);
        usuario.setDataNascimento(LocalDate.of(1980, 5, 15));
        usuario.setAtivo(true);
        usuario = usuarioRepository.save(usuario);

        // Criar usuário profissional
        Usuario usuario2 = new Usuario();
        usuario2.setNome("Dr. João Silva 2");
        usuario2.setEmail("joao.silva2@doctorplus.com");
        usuario2.setSenha(passwordEncoder.encode("123456"));
        usuario2.setTipo(TipoUsuario.PROFISSIONAL);
        usuario2.setDataNascimento(LocalDate.of(1980, 5, 15));
        usuario2.setAtivo(true);
        usuario2 = usuarioRepository.save(usuario2);

        // Criar profissional
        Profissional profissional = new Profissional();
        profissional.setUsuario(usuario);
        profissional.setEspecialidade("Clínica Geral");
        profissional.setCrm("CRM-12345");
        return profissionalRepository.save(profissional);
    }

    private void createSamplePacientes(Usuario admin, int count) {
        String[] nomes = {
            "Maria Silva Santos", "João Pedro Oliveira", "Ana Carolina Costa", "Carlos Eduardo Lima",
            "Fernanda Alves", "Roberto Santos", "Juliana Ferreira", "Pedro Henrique", "Camila Rodrigues",
            "Lucas Martins", "Beatriz Almeida", "Rafael Souza", "Larissa Pereira", "Gustavo Ribeiro",
            "Mariana Carvalho", "Felipe Barbosa", "Isabela Nascimento", "Thiago Moreira", "Gabriela Dias",
            "Leonardo Cardoso", "Natália Ramos", "Bruno Teixeira", "Letícia Gomes", "Mateus Araújo",
            "Vitória Monteiro"
        };

        String[] sobrenomes = {
            "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira",
            "Lima", "Gomes", "Ribeiro", "Carvalho", "Martins", "Rocha", "Barbosa", "Almeida",
            "Costa", "Nascimento", "Araújo", "Melo", "Cardoso", "Dias", "Moreira", "Ramos"
        };

        for (int i = 0; i < count; i++) {
            Paciente paciente = new Paciente();
            
            String nome = nomes[random.nextInt(nomes.length)];
            paciente.setNome(nome);
            paciente.setCpf(generateCPF());
            paciente.setEmail(generateEmail(nome));
            paciente.setTelefone(generatePhone());
            paciente.setEndereco(generateAddress());
            paciente.setDataNascimento(generateBirthDate());
            paciente.setUsuario(admin);

            pacienteRepository.save(paciente);
        }

        logger.info("Criados {} pacientes de exemplo", count);
    }

    private void createSampleEstoque(int count) {
        String[][] medicamentos = {
            {"Paracetamol 500mg", "MED001", "Medicamentos", "CP"},
            {"Dipirona 500mg", "MED002", "Medicamentos", "CP"},
            {"Amoxicilina 500mg", "MED003", "Medicamentos", "CP"},
            {"Omeprazol 20mg", "MED004", "Medicamentos", "CP"},
            {"Losartana 50mg", "MED005", "Medicamentos", "CP"},
            {"Metformina 850mg", "MED006", "Medicamentos", "CP"},
            {"Sinvastatina 20mg", "MED007", "Medicamentos", "CP"},
            {"Captopril 25mg", "MED008", "Medicamentos", "CP"},
            {"Seringa 5ml", "MAT001", "Material Cirúrgico", "UN"},
            {"Seringa 10ml", "MAT002", "Material Cirúrgico", "UN"},
            {"Agulha 25x7", "MAT003", "Material Cirúrgico", "UN"},
            {"Gaze Estéril", "MAT004", "Material Cirúrgico", "PCT"},
            {"Luva Descartável P", "MAT005", "Descartáveis", "CX"},
            {"Luva Descartável M", "MAT006", "Descartáveis", "CX"},
            {"Luva Descartável G", "MAT007", "Descartáveis", "CX"},
            {"Máscara Cirúrgica", "MAT008", "Descartáveis", "CX"},
            {"Álcool 70%", "HIG001", "Higiene", "L"},
            {"Álcool Gel", "HIG002", "Higiene", "L"},
            {"Sabonete Líquido", "HIG003", "Higiene", "L"},
            {"Papel Toalha", "HIG004", "Higiene", "PCT"},
            {"Termômetro Digital", "EQP001", "Equipamentos", "UN"},
            {"Estetoscópio", "EQP002", "Equipamentos", "UN"},
            {"Esfigmomanômetro", "EQP003", "Equipamentos", "UN"},
            {"Otoscópio", "EQP004", "Equipamentos", "UN"},
            {"Curativo Adesivo", "MAT009", "Material Cirúrgico", "UN"},
            {"Atadura Elástica", "MAT010", "Material Cirúrgico", "UN"},
            {"Soro Fisiológico 500ml", "MED009", "Medicamentos", "FR"},
            {"Água Destilada 500ml", "MED010", "Medicamentos", "FR"},
            {"Iodo 2%", "HIG005", "Higiene", "FR"},
            {"Micropore 2,5cm", "MAT011", "Material Cirúrgico", "UN"}
        };

        for (int i = 0; i < Math.min(count, medicamentos.length); i++) {
            String[] item = medicamentos[i];
            
            Estoque estoque = new Estoque();
            estoque.setNome(item[0]);
            estoque.setCodigo(item[1]);
            estoque.setCategoria(item[2]);
            estoque.setUnidade(item[3]);
            estoque.setQuantidade(random.nextInt(200) + 10); // 10 a 210
            estoque.setMinAlerta(random.nextInt(20) + 5); // 5 a 25
            estoque.setValorUnitario(BigDecimal.valueOf(random.nextDouble() * 100 + 1)); // R$ 1 a 101
            estoque.setDescricao("Descrição detalhada do produto " + item[0]);
            estoque.setAtivo(true);

            estoqueRepository.save(estoque);
        }

        logger.info("Criados {} itens de estoque de exemplo", Math.min(count, medicamentos.length));
    }

    private void createSampleHistoricos(Profissional profissional, int count) {
        List<Paciente> pacientes = pacienteRepository.findAll();
        if (pacientes.isEmpty()) return;

        String[] descricoes = {
            "Paciente apresentou febre alta (39°C) e dor de cabeça intensa. Relatou início dos sintomas há 2 dias.",
            "Consulta de rotina. Paciente sem queixas específicas. Solicitados exames preventivos.",
            "Dor abdominal localizada em fossa ilíaca direita. Suspeita de apendicite. Encaminhado para cirurgia.",
            "Hipertensão arterial descontrolada. Ajuste na medicação anti-hipertensiva.",
            "Diabetes mellitus tipo 2. Orientações sobre dieta e exercícios. Ajuste na insulina.",
            "Infecção respiratória alta. Tosse seca e coriza há 5 dias.",
            "Lesão no joelho direito após queda. Suspeita de entorse.",
            "Cefaleia tensional crônica. Paciente relata estresse no trabalho.",
            "Gastrite aguda. Dor epigástrica após alimentação.",
            "Consulta pré-natal. Gestação de 20 semanas sem intercorrências."
        };

        String[] diagnosticos = {
            "Síndrome gripal", "Exame de rotina normal", "Apendicite aguda", 
            "Hipertensão arterial sistêmica", "Diabetes mellitus tipo 2",
            "Rinofaringite viral", "Entorse de joelho", "Cefaleia tensional",
            "Gastrite aguda", "Gestação normal"
        };

        String[] prescricoes = {
            "Paracetamol 750mg - 1 cp de 8/8h por 5 dias\nRepouso e hidratação",
            "Retorno em 6 meses para reavaliação\nManter hábitos saudáveis",
            "Jejum absoluto\nEncaminhamento para cirurgia de urgência",
            "Losartana 50mg - 1 cp pela manhã\nDieta hipossódica",
            "Metformina 850mg - 1 cp 12/12h\nInsulina NPH 20UI pela manhã",
            "Dipirona 500mg - 1 cp se dor\nRepouso vocal",
            "Anti-inflamatório tópico\nFisioterapia",
            "Relaxante muscular\nTécnicas de relaxamento",
            "Omeprazol 20mg - 1 cp em jejum\nDieta leve",
            "Ácido fólico 5mg - 1 cp/dia\nRetorno em 4 semanas"
        };

        for (int i = 0; i < count; i++) {
            Paciente paciente = pacientes.get(random.nextInt(pacientes.size()));
            
            Historico historico = new Historico();
            historico.setPaciente(paciente);
            historico.setProfissional(profissional);
            
            int index = random.nextInt(descricoes.length);
            historico.setDescricao(descricoes[index]);
            historico.setDiagnostico(diagnosticos[index]);
            historico.setPrescricao(prescricoes[index]);
            
            // Data aleatória nos últimos 6 meses
            LocalDateTime dataConsulta = LocalDateTime.now()
                    .minusDays(random.nextInt(180))
                    .withHour(random.nextInt(12) + 8) // 8h às 19h
                    .withMinute(random.nextInt(4) * 15); // 0, 15, 30, 45
            
            historico.setDataConsulta(dataConsulta);

            historicoRepository.save(historico);
        }

        logger.info("Criados {} históricos de exemplo", count);
    }

    private void createSampleConsultas(Profissional profissional, int count) {
        List<Paciente> pacientes = pacienteRepository.findAll();
        if (pacientes.isEmpty()) return;

        StatusConsulta[] statuses = {StatusConsulta.AGENDADA, StatusConsulta.CONFIRMADA, StatusConsulta.REALIZADA};
        BigDecimal[] valores = {
            BigDecimal.valueOf(150.00), BigDecimal.valueOf(200.00), BigDecimal.valueOf(180.00),
            BigDecimal.valueOf(250.00), BigDecimal.valueOf(300.00), BigDecimal.valueOf(120.00)
        };

        for (int i = 0; i < count; i++) {
            Paciente paciente = pacientes.get(random.nextInt(pacientes.size()));
            
            Consulta consulta = new Consulta();
            consulta.setPaciente(paciente);
            consulta.setProfissional(profissional);
            
            // Metade consultas futuras, metade passadas
            LocalDateTime dataHora;
            if (i < count / 2) {
                // Consultas futuras (próximos 30 dias)
                dataHora = LocalDateTime.now()
                        .plusDays(random.nextInt(30) + 1)
                        .withHour(random.nextInt(10) + 8) // 8h às 17h
                        .withMinute(random.nextInt(4) * 15); // 0, 15, 30, 45
                consulta.setStatus(statuses[random.nextInt(2)]); // AGENDADA ou CONFIRMADA
            } else {
                // Consultas passadas (últimos 60 dias)
                dataHora = LocalDateTime.now()
                        .minusDays(random.nextInt(60) + 1)
                        .withHour(random.nextInt(10) + 8)
                        .withMinute(random.nextInt(4) * 15);
                consulta.setStatus(StatusConsulta.REALIZADA);
            }
            
            consulta.setDataHora(dataHora);
            consulta.setDuracaoMinutos(random.nextBoolean() ? 60 : 30);
            consulta.setValor(valores[random.nextInt(valores.length)]);
            
            if (random.nextBoolean()) {
                consulta.setObservacoes("Consulta de " + (random.nextBoolean() ? "rotina" : "retorno"));
            }

            consultaRepository.save(consulta);
        }

        logger.info("Criadas {} consultas de exemplo", count);
    }

    private String generateCPF() {
        // Gera CPF válido
        int[] cpf = new int[11];
        
        // Primeiros 9 dígitos aleatórios
        for (int i = 0; i < 9; i++) {
            cpf[i] = random.nextInt(10);
        }
        
        // Calcula primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += cpf[i] * (10 - i);
        }
        cpf[9] = (soma * 10) % 11;
        if (cpf[9] >= 10) cpf[9] = 0;
        
        // Calcula segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += cpf[i] * (11 - i);
        }
        cpf[10] = (soma * 10) % 11;
        if (cpf[10] >= 10) cpf[10] = 0;
        
        StringBuilder sb = new StringBuilder();
        for (int digit : cpf) {
            sb.append(digit);
        }
        return sb.toString();
    }

    private String generateEmail(String nome) {
        String[] dominios = {"gmail.com", "hotmail.com", "yahoo.com.br", "outlook.com"};
        String nomeEmail = nome.toLowerCase()
                .replace(" ", ".")
                .replaceAll("[^a-z.]", "");
        return nomeEmail + random.nextInt(100) + "@" + dominios[random.nextInt(dominios.length)];
    }

    private String generatePhone() {
        return "11" + (900000000 + random.nextInt(99999999));
    }

    private String generateAddress() {
        String[] ruas = {
            "Rua das Flores", "Av. Paulista", "Rua Augusta", "Rua Oscar Freire",
            "Av. Faria Lima", "Rua Consolação", "Av. Rebouças", "Rua Teodoro Sampaio"
        };
        String[] bairros = {
            "Vila Madalena", "Pinheiros", "Jardins", "Moema", "Itaim Bibi",
            "Vila Olímpia", "Brooklin", "Santo Amaro"
        };
        
        String rua = ruas[random.nextInt(ruas.length)];
        int numero = random.nextInt(2000) + 1;
        String bairro = bairros[random.nextInt(bairros.length)];
        String cep = String.format("%05d-%03d", random.nextInt(99999), random.nextInt(999));
        
        return String.format("%s, %d - %s, São Paulo - SP, %s", rua, numero, bairro, cep);
    }

    private LocalDate generateBirthDate() {
        int anoAtual = LocalDate.now().getYear();
        int anoNascimento = anoAtual - (random.nextInt(70) + 18); // 18 a 88 anos
        int mes = random.nextInt(12) + 1;
        int dia = random.nextInt(28) + 1; // Para evitar problemas com fevereiro
        
        return LocalDate.of(anoNascimento, mes, dia);
    }
}