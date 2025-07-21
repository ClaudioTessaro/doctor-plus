package com.doctorplus.dto.response;

import com.doctorplus.domain.enums.StatusConsulta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ConsultaResponse {

    private Long id;
    private PacienteResponse paciente;
    private ProfissionalResponse profissional;
    private LocalDateTime dataHora;
    private Integer duracaoMinutos;
    private String observacoes;
    private StatusConsulta status;
    private BigDecimal valor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ConsultaResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PacienteResponse getPaciente() {
        return paciente;
    }

    public void setPaciente(PacienteResponse paciente) {
        this.paciente = paciente;
    }

    public ProfissionalResponse getProfissional() {
        return profissional;
    }

    public void setProfissional(ProfissionalResponse profissional) {
        this.profissional = profissional;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public Integer getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public void setDuracaoMinutos(Integer duracaoMinutos) {
        this.duracaoMinutos = duracaoMinutos;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public StatusConsulta getStatus() {
        return status;
    }

    public void setStatus(StatusConsulta status) {
        this.status = status;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}