package com.doctorplus.service;

import com.doctorplus.domain.enums.StatusConsulta;
import com.doctorplus.dto.response.DashboardStatsResponse;
import com.doctorplus.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;
    private final HistoricoRepository historicoRepository;
    private final EstoqueRepository estoqueRepository;
    private final ProfissionalRepository profissionalRepository;
    private final SecretarioRepository secretarioRepository;
    private final SecurityService securityService;

    @Autowired
    public DashboardService(PacienteRepository pacienteRepository,
                           ConsultaRepository consultaRepository,
                           HistoricoRepository historicoRepository,
                           EstoqueRepository estoqueRepository,
                           ProfissionalRepository profissionalRepository,
                           SecretarioRepository secretarioRepository,
                           SecurityService securityService) {
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
        this.historicoRepository = historicoRepository;
        this.estoqueRepository = estoqueRepository;
        this.profissionalRepository = profissionalRepository;
        this.secretarioRepository = secretarioRepository;
        this.securityService = securityService;
    }

    public DashboardStatsResponse getStats(String userEmail) {
        logger.info("Buscando estatísticas do dashboard para: {}", userEmail);

        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime ontem = hoje.minusDays(1);
        LocalDateTime inicioSemana = hoje.minusDays(hoje.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0);

        // Obter IDs acessíveis baseado no tipo de usuário
        List<Long> accessiblePacienteIds = securityService.getAccessiblePacienteIds(userEmail);
        List<Long> accessibleProfissionalIds = securityService.getAccessibleProfissionalIds(userEmail);
        List<Long> accessibleSecretarioIds = securityService.getAccessibleSecretarioIds(userEmail);

        // Estatísticas gerais
        Long totalPacientes = accessiblePacienteIds == null ? 
            pacienteRepository.countTotalPacientes() : 
            pacienteRepository.countAccessiblePacientes(accessiblePacienteIds);
            
        Long totalProfissionais = accessibleProfissionalIds == null ? 
            profissionalRepository.countTotalProfissionais() : 
            profissionalRepository.countAccessibleProfissionais(accessibleProfissionalIds);
            
        Long totalSecretarios = accessibleSecretarioIds == null ? 
            secretarioRepository.countTotalSecretarios() : 
            secretarioRepository.countAccessibleSecretarios(accessibleSecretarioIds);
            
        Long totalHistoricos = accessibleProfissionalIds == null ? 
            historicoRepository.countTotalHistoricos() : 
            historicoRepository.countAccessibleHistoricos(accessibleProfissionalIds);

        // Consultas
        Long consultasHoje = accessibleProfissionalIds == null ?
            consultaRepository.countConsultasNoPeriodo(
                hoje.withHour(0).withMinute(0).withSecond(0),
                hoje.withHour(23).withMinute(59).withSecond(59)
            ) :
            consultaRepository.countAccessibleConsultasNoPeriodo(
                hoje.withHour(0).withMinute(0).withSecond(0),
                hoje.withHour(23).withMinute(59).withSecond(59),
                accessibleProfissionalIds
            );
            
        Long consultasSemana = accessibleProfissionalIds == null ?
            consultaRepository.countConsultasNoPeriodo(inicioSemana, hoje) :
            consultaRepository.countAccessibleConsultasNoPeriodo(inicioSemana, hoje, accessibleProfissionalIds);
            
        Long consultasMes = accessibleProfissionalIds == null ?
            consultaRepository.countConsultasNoPeriodo(inicioMes, fimMes) :
            consultaRepository.countAccessibleConsultasNoPeriodo(inicioMes, fimMes, accessibleProfissionalIds);

        // Estoque
        Long profissionalIdEstoque = getProfissionalIdForEstoque(userEmail);
        Long itensEstoque = estoqueRepository.countByAtivoTrue(profissionalIdEstoque);
        Long itensEstoqueBaixo = estoqueRepository.countItensComEstoqueBaixo(profissionalIdEstoque);
        Long itensEsgotados = estoqueRepository.countItensEsgotados(profissionalIdEstoque);

        // Pacientes novos
        Long pacientesNovosHoje = accessiblePacienteIds == null ?
            pacienteRepository.countPacientesNovos(
                hoje.withHour(0).withMinute(0).withSecond(0),
                hoje.withHour(23).withMinute(59).withSecond(59)
            ) :
            pacienteRepository.countAccessiblePacientesNovos(
                hoje.withHour(0).withMinute(0).withSecond(0),
                hoje.withHour(23).withMinute(59).withSecond(59),
                accessiblePacienteIds
            );
            
        Long pacientesNovosSemana = accessiblePacienteIds == null ?
            pacienteRepository.countPacientesNovos(inicioSemana, hoje) :
            pacienteRepository.countAccessiblePacientesNovos(inicioSemana, hoje, accessiblePacienteIds);

        // Consultas por status
        Long consultasAgendadas = accessibleProfissionalIds == null ?
            consultaRepository.countByStatus(StatusConsulta.AGENDADA) :
            consultaRepository.countAccessibleByStatus(StatusConsulta.AGENDADA, accessibleProfissionalIds);
            
        Long consultasConfirmadas = accessibleProfissionalIds == null ?
            consultaRepository.countByStatus(StatusConsulta.CONFIRMADA) :
            consultaRepository.countAccessibleByStatus(StatusConsulta.CONFIRMADA, accessibleProfissionalIds);
            
        Long consultasRealizadas = accessibleProfissionalIds == null ?
            consultaRepository.countConsultasRealizadasMes(inicioMes, fimMes) :
            consultaRepository.countAccessibleConsultasRealizadasMes(inicioMes, fimMes, accessibleProfissionalIds);

        // Receita do mês
        BigDecimal receitaMes = accessibleProfissionalIds == null ?
            consultaRepository.sumReceitaMes(inicioMes, fimMes) :
            consultaRepository.sumAccessibleReceitaMes(inicioMes, fimMes, accessibleProfissionalIds);

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalPacientes(totalPacientes);
        stats.setTotalProfissionais(totalProfissionais);
        stats.setTotalSecretarios(totalSecretarios);
        stats.setTotalHistoricos(totalHistoricos);
        stats.setConsultasHoje(consultasHoje);
        stats.setConsultasSemana(consultasSemana);
        stats.setConsultasMes(consultasMes);
        stats.setItensEstoque(itensEstoque);
        stats.setItensEstoqueBaixo(itensEstoqueBaixo);
        stats.setItensEsgotados(itensEsgotados);
        stats.setPacientesNovosHoje(pacientesNovosHoje);
        stats.setPacientesNovosSemana(pacientesNovosSemana);
        stats.setConsultasAgendadas(consultasAgendadas);
        stats.setConsultasConfirmadas(consultasConfirmadas);
        stats.setConsultasRealizadas(consultasRealizadas);
        stats.setReceitaMes(receitaMes != null ? receitaMes : BigDecimal.ZERO);

        return stats;
    }

    public DashboardStatsResponse.PacienteStats getPacienteStats(String userEmail) {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime mesPassado = inicioMes.minusMonths(1);
        LocalDateTime fimMesPassado = mesPassado.withDayOfMonth(mesPassado.toLocalDate().lengthOfMonth());

        List<Long> accessibleIds = securityService.getAccessiblePacienteIds(userEmail);
        
        Long totalPacientes = accessibleIds == null ?
            pacienteRepository.countTotalPacientes() :
            pacienteRepository.countAccessiblePacientes(accessibleIds);
            
        Long pacientesMes = accessibleIds == null ?
            pacienteRepository.countPacientesNovos(inicioMes, hoje) :
            pacienteRepository.countAccessiblePacientesNovos(inicioMes, hoje, accessibleIds);
            
        Long pacientesMesPassado = accessibleIds == null ?
            pacienteRepository.countPacientesNovos(mesPassado, fimMesPassado) :
            pacienteRepository.countAccessiblePacientesNovos(mesPassado, fimMesPassado, accessibleIds);

        Double crescimentoMensal = calcularCrescimento(pacientesMes, pacientesMesPassado);

        DashboardStatsResponse.PacienteStats stats = new DashboardStatsResponse.PacienteStats();
        stats.setTotal(totalPacientes);
        stats.setNovosMes(pacientesMes);
        stats.setCrescimentoMensal(crescimentoMensal);

        return stats;
    }

    public DashboardStatsResponse.ConsultaStats getConsultaStats(String userEmail) {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);

        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        Long totalMes = accessibleIds == null ?
            consultaRepository.countConsultasNoPeriodo(inicioMes, fimMes) :
            consultaRepository.countAccessibleConsultasNoPeriodo(inicioMes, fimMes, accessibleIds);
            
        Long agendadas = accessibleIds == null ?
            consultaRepository.countByStatus(StatusConsulta.AGENDADA) :
            consultaRepository.countAccessibleByStatus(StatusConsulta.AGENDADA, accessibleIds);
            
        Long confirmadas = accessibleIds == null ?
            consultaRepository.countByStatus(StatusConsulta.CONFIRMADA) :
            consultaRepository.countAccessibleByStatus(StatusConsulta.CONFIRMADA, accessibleIds);
            
        Long realizadas = accessibleIds == null ?
            consultaRepository.countConsultasRealizadasMes(inicioMes, fimMes) :
            consultaRepository.countAccessibleConsultasRealizadasMes(inicioMes, fimMes, accessibleIds);
            
        Long canceladas = accessibleIds == null ?
            consultaRepository.countByStatus(StatusConsulta.CANCELADA) :
            consultaRepository.countAccessibleByStatus(StatusConsulta.CANCELADA, accessibleIds);

        Double taxaRealizacao = totalMes > 0 ? (realizadas.doubleValue() / totalMes.doubleValue()) * 100 : 0.0;

        DashboardStatsResponse.ConsultaStats stats = new DashboardStatsResponse.ConsultaStats();
        stats.setTotalMes(totalMes);
        stats.setAgendadas(agendadas);
        stats.setConfirmadas(confirmadas);
        stats.setRealizadas(realizadas);
        stats.setCanceladas(canceladas);
        stats.setTaxaRealizacao(taxaRealizacao);

        return stats;
    }

    public DashboardStatsResponse.FinanceiroStats getFinanceiroStats(String userEmail) {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime mesPassado = inicioMes.minusMonths(1);
        LocalDateTime fimMesPassado = mesPassado.withDayOfMonth(mesPassado.toLocalDate().lengthOfMonth());

        List<Long> accessibleIds = securityService.getAccessibleProfissionalIds(userEmail);
        
        BigDecimal receitaMes = accessibleIds == null ?
            consultaRepository.sumReceitaMes(inicioMes, fimMes) :
            consultaRepository.sumAccessibleReceitaMes(inicioMes, fimMes, accessibleIds);
            
        BigDecimal receitaMesPassado = accessibleIds == null ?
            consultaRepository.sumReceitaMes(mesPassado, fimMesPassado) :
            consultaRepository.sumAccessibleReceitaMes(mesPassado, fimMesPassado, accessibleIds);
            
        BigDecimal receitaHoje = accessibleIds == null ?
            consultaRepository.sumReceitaDia(
                hoje.withHour(0).withMinute(0).withSecond(0),
                hoje.withHour(23).withMinute(59).withSecond(59)
            ) :
            consultaRepository.sumAccessibleReceitaDia(
                hoje.withHour(0).withMinute(0).withSecond(0),
                hoje.withHour(23).withMinute(59).withSecond(59),
                accessibleIds
            );

        Double crescimentoMensal = calcularCrescimentoFinanceiro(receitaMes, receitaMesPassado);
        BigDecimal ticketMedio = accessibleIds == null ?
            consultaRepository.avgTicketMedio(inicioMes, fimMes) :
            consultaRepository.avgAccessibleTicketMedio(inicioMes, fimMes, accessibleIds);

        DashboardStatsResponse.FinanceiroStats stats = new DashboardStatsResponse.FinanceiroStats();
        stats.setReceitaMes(receitaMes != null ? receitaMes : BigDecimal.ZERO);
        stats.setReceitaHoje(receitaHoje != null ? receitaHoje : BigDecimal.ZERO);
        stats.setCrescimentoMensal(crescimentoMensal);
        stats.setTicketMedio(ticketMedio != null ? ticketMedio : BigDecimal.ZERO);

        return stats;
    }

    private Double calcularCrescimento(Long atual, Long anterior) {
        if (anterior == null || anterior == 0) {
            return atual > 0 ? 100.0 : 0.0;
        }
        return ((atual.doubleValue() - anterior.doubleValue()) / anterior.doubleValue()) * 100;
    }

    private Long getProfissionalIdForEstoque(String userEmail) {
        if (securityService.isAdmin(userEmail)) {
            return null; // Admin vê todos os estoques
        }
        
        return profissionalRepository.findByUsuarioEmail(userEmail)
            .map(p -> p.getId())
            .orElse(null);
    }

    private Double calcularCrescimentoFinanceiro(BigDecimal atual, BigDecimal anterior) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0) {
            return atual.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return atual.subtract(anterior).divide(anterior, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
    }
}