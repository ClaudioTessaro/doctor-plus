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

    @Autowired
    public DashboardService(PacienteRepository pacienteRepository,
                           ConsultaRepository consultaRepository,
                           HistoricoRepository historicoRepository,
                           EstoqueRepository estoqueRepository,
                           ProfissionalRepository profissionalRepository,
                           SecretarioRepository secretarioRepository) {
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
        this.historicoRepository = historicoRepository;
        this.estoqueRepository = estoqueRepository;
        this.profissionalRepository = profissionalRepository;
        this.secretarioRepository = secretarioRepository;
    }

    public DashboardStatsResponse getStats() {
        logger.info("Buscando estatísticas do dashboard");

        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime ontem = hoje.minusDays(1);
        LocalDateTime inicioSemana = hoje.minusDays(hoje.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0);

        // Estatísticas gerais
        Long totalPacientes = pacienteRepository.countTotalPacientes();
        Long totalProfissionais = profissionalRepository.countTotalProfissionais();
        Long totalSecretarios = secretarioRepository.countTotalSecretarios();
        Long totalHistoricos = historicoRepository.countTotalHistoricos();

        // Consultas
        Long consultasHoje = consultaRepository.countConsultasNoPeriodo(
            hoje.withHour(0).withMinute(0).withSecond(0),
            hoje.withHour(23).withMinute(59).withSecond(59)
        );
        Long consultasSemana = consultaRepository.countConsultasNoPeriodo(inicioSemana, hoje);
        Long consultasMes = consultaRepository.countConsultasNoPeriodo(inicioMes, fimMes);

        // Estoque
        Long itensEstoque = estoqueRepository.countByAtivoTrue();
        Long itensEstoqueBaixo = estoqueRepository.countItensComEstoqueBaixo();
        Long itensEsgotados = estoqueRepository.countItensEsgotados();

        // Pacientes novos
        Long pacientesNovosHoje = pacienteRepository.countPacientesNovos(
            hoje.withHour(0).withMinute(0).withSecond(0),
            hoje.withHour(23).withMinute(59).withSecond(59)
        );
        Long pacientesNovosSemana = pacienteRepository.countPacientesNovos(inicioSemana, hoje);

        // Consultas por status
        Long consultasAgendadas = consultaRepository.countByStatus(StatusConsulta.AGENDADA);
        Long consultasConfirmadas = consultaRepository.countByStatus(StatusConsulta.CONFIRMADA);
        Long consultasRealizadas = consultaRepository.countConsultasRealizadasMes(inicioMes, fimMes);

        // Receita do mês
        BigDecimal receitaMes = consultaRepository.sumReceitaMes(inicioMes, fimMes);

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

    public DashboardStatsResponse.PacienteStats getPacienteStats() {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime mesPassado = inicioMes.minusMonths(1);
        LocalDateTime fimMesPassado = mesPassado.withDayOfMonth(mesPassado.toLocalDate().lengthOfMonth());

        Long totalPacientes = pacienteRepository.countTotalPacientes();
        Long pacientesMes = pacienteRepository.countPacientesNovos(inicioMes, hoje);
        Long pacientesMesPassado = pacienteRepository.countPacientesNovos(mesPassado, fimMesPassado);

        Double crescimentoMensal = calcularCrescimento(pacientesMes, pacientesMesPassado);

        DashboardStatsResponse.PacienteStats stats = new DashboardStatsResponse.PacienteStats();
        stats.setTotal(totalPacientes);
        stats.setNovosMes(pacientesMes);
        stats.setCrescimentoMensal(crescimentoMensal);

        return stats;
    }

    public DashboardStatsResponse.ConsultaStats getConsultaStats() {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);

        Long totalMes = consultaRepository.countConsultasNoPeriodo(inicioMes, fimMes);
        Long agendadas = consultaRepository.countByStatus(StatusConsulta.AGENDADA);
        Long confirmadas = consultaRepository.countByStatus(StatusConsulta.CONFIRMADA);
        Long realizadas = consultaRepository.countConsultasRealizadasMes(inicioMes, fimMes);
        Long canceladas = consultaRepository.countByStatus(StatusConsulta.CANCELADA);

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

    public DashboardStatsResponse.FinanceiroStats getFinanceiroStats() {
        LocalDateTime hoje = LocalDateTime.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime mesPassado = inicioMes.minusMonths(1);
        LocalDateTime fimMesPassado = mesPassado.withDayOfMonth(mesPassado.toLocalDate().lengthOfMonth());

        BigDecimal receitaMes = consultaRepository.sumReceitaMes(inicioMes, fimMes);
        BigDecimal receitaMesPassado = consultaRepository.sumReceitaMes(mesPassado, fimMesPassado);
        BigDecimal receitaHoje = consultaRepository.sumReceitaDia(
            hoje.withHour(0).withMinute(0).withSecond(0),
            hoje.withHour(23).withMinute(59).withSecond(59)
        );

        Double crescimentoMensal = calcularCrescimentoFinanceiro(receitaMes, receitaMesPassado);
        BigDecimal ticketMedio = consultaRepository.avgTicketMedio(inicioMes, fimMes);

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

    private Double calcularCrescimentoFinanceiro(BigDecimal atual, BigDecimal anterior) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0) {
            return atual.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return atual.subtract(anterior).divide(anterior, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
    }
}