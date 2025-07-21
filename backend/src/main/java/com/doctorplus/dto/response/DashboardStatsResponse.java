package com.doctorplus.dto.response;

import java.math.BigDecimal;

public class DashboardStatsResponse {

    // Estatísticas gerais
    private Long totalPacientes;
    private Long totalProfissionais;
    private Long totalSecretarios;
    private Long totalHistoricos;

    // Consultas
    private Long consultasHoje;
    private Long consultasSemana;
    private Long consultasMes;
    private Long consultasAgendadas;
    private Long consultasConfirmadas;
    private Long consultasRealizadas;

    // Estoque
    private Long itensEstoque;
    private Long itensEstoqueBaixo;
    private Long itensEsgotados;

    // Pacientes novos
    private Long pacientesNovosHoje;
    private Long pacientesNovosSemana;

    // Financeiro
    private BigDecimal receitaMes;

    // Constructors
    public DashboardStatsResponse() {}

    // Getters and Setters
    public Long getTotalPacientes() {
        return totalPacientes;
    }

    public void setTotalPacientes(Long totalPacientes) {
        this.totalPacientes = totalPacientes;
    }

    public Long getTotalProfissionais() {
        return totalProfissionais;
    }

    public void setTotalProfissionais(Long totalProfissionais) {
        this.totalProfissionais = totalProfissionais;
    }

    public Long getTotalSecretarios() {
        return totalSecretarios;
    }

    public void setTotalSecretarios(Long totalSecretarios) {
        this.totalSecretarios = totalSecretarios;
    }

    public Long getTotalHistoricos() {
        return totalHistoricos;
    }

    public void setTotalHistoricos(Long totalHistoricos) {
        this.totalHistoricos = totalHistoricos;
    }

    public Long getConsultasHoje() {
        return consultasHoje;
    }

    public void setConsultasHoje(Long consultasHoje) {
        this.consultasHoje = consultasHoje;
    }

    public Long getConsultasSemana() {
        return consultasSemana;
    }

    public void setConsultasSemana(Long consultasSemana) {
        this.consultasSemana = consultasSemana;
    }

    public Long getConsultasMes() {
        return consultasMes;
    }

    public void setConsultasMes(Long consultasMes) {
        this.consultasMes = consultasMes;
    }

    public Long getConsultasAgendadas() {
        return consultasAgendadas;
    }

    public void setConsultasAgendadas(Long consultasAgendadas) {
        this.consultasAgendadas = consultasAgendadas;
    }

    public Long getConsultasConfirmadas() {
        return consultasConfirmadas;
    }

    public void setConsultasConfirmadas(Long consultasConfirmadas) {
        this.consultasConfirmadas = consultasConfirmadas;
    }

    public Long getConsultasRealizadas() {
        return consultasRealizadas;
    }

    public void setConsultasRealizadas(Long consultasRealizadas) {
        this.consultasRealizadas = consultasRealizadas;
    }

    public Long getItensEstoque() {
        return itensEstoque;
    }

    public void setItensEstoque(Long itensEstoque) {
        this.itensEstoque = itensEstoque;
    }

    public Long getItensEstoqueBaixo() {
        return itensEstoqueBaixo;
    }

    public void setItensEstoqueBaixo(Long itensEstoqueBaixo) {
        this.itensEstoqueBaixo = itensEstoqueBaixo;
    }

    public Long getItensEsgotados() {
        return itensEsgotados;
    }

    public void setItensEsgotados(Long itensEsgotados) {
        this.itensEsgotados = itensEsgotados;
    }

    public Long getPacientesNovosHoje() {
        return pacientesNovosHoje;
    }

    public void setPacientesNovosHoje(Long pacientesNovosHoje) {
        this.pacientesNovosHoje = pacientesNovosHoje;
    }

    public Long getPacientesNovosSemana() {
        return pacientesNovosSemana;
    }

    public void setPacientesNovosSemana(Long pacientesNovosSemana) {
        this.pacientesNovosSemana = pacientesNovosSemana;
    }

    public BigDecimal getReceitaMes() {
        return receitaMes;
    }

    public void setReceitaMes(BigDecimal receitaMes) {
        this.receitaMes = receitaMes;
    }

    // Nested classes for detailed stats
    public static class PacienteStats {
        private Long total;
        private Long novosMes;
        private Double crescimentoMensal;

        // Getters and Setters
        public Long getTotal() { return total; }
        public void setTotal(Long total) { this.total = total; }
        
        public Long getNovosMes() { return novosMes; }
        public void setNovosMes(Long novosMes) { this.novosMes = novosMes; }
        
        public Double getCrescimentoMensal() { return crescimentoMensal; }
        public void setCrescimentoMensal(Double crescimentoMensal) { this.crescimentoMensal = crescimentoMensal; }
    }

    public static class ConsultaStats {
        private Long totalMes;
        private Long agendadas;
        private Long confirmadas;
        private Long realizadas;
        private Long canceladas;
        private Double taxaRealizacao;

        // Getters and Setters
        public Long getTotalMes() { return totalMes; }
        public void setTotalMes(Long totalMes) { this.totalMes = totalMes; }
        
        public Long getAgendadas() { return agendadas; }
        public void setAgendadas(Long agendadas) { this.agendadas = agendadas; }
        
        public Long getConfirmadas() { return confirmadas; }
        public void setConfirmadas(Long confirmadas) { this.confirmadas = confirmadas; }
        
        public Long getRealizadas() { return realizadas; }
        public void setRealizadas(Long realizadas) { this.realizadas = realizadas; }
        
        public Long getCanceladas() { return canceladas; }
        public void setCanceladas(Long canceladas) { this.canceladas = canceladas; }
        
        public Double getTaxaRealizacao() { return taxaRealizacao; }
        public void setTaxaRealizacao(Double taxaRealizacao) { this.taxaRealizacao = taxaRealizacao; }
    }

    public static class FinanceiroStats {
        private BigDecimal receitaMes;
        private BigDecimal receitaHoje;
        private Double crescimentoMensal;
        private BigDecimal ticketMedio;

        // Getters and Setters
        public BigDecimal getReceitaMes() { return receitaMes; }
        public void setReceitaMes(BigDecimal receitaMes) { this.receitaMes = receitaMes; }
        
        public BigDecimal getReceitaHoje() { return receitaHoje; }
        public void setReceitaHoje(BigDecimal receitaHoje) { this.receitaHoje = receitaHoje; }
        
        public Double getCrescimentoMensal() { return crescimentoMensal; }
        public void setCrescimentoMensal(Double crescimentoMensal) { this.crescimentoMensal = crescimentoMensal; }
        
        public BigDecimal getTicketMedio() { return ticketMedio; }
        public void setTicketMedio(BigDecimal ticketMedio) { this.ticketMedio = ticketMedio; }
    }
}