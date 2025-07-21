package com.doctorplus.dto.response;

import java.time.LocalDateTime;

public class HistoricoResponse {

    private Long id;
    private PacienteResponse paciente;
    private ProfissionalResponse profissional;
    private String descricao;
    private String diagnostico;
    private String prescricao;
    private LocalDateTime dataConsulta;
    private LocalDateTime createdAt;

    // Constructors
    public HistoricoResponse() {}

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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getPrescricao() {
        return prescricao;
    }

    public void setPrescricao(String prescricao) {
        this.prescricao = prescricao;
    }

    public LocalDateTime getDataConsulta() {
        return dataConsulta;
    }

    public void setDataConsulta(LocalDateTime dataConsulta) {
        this.dataConsulta = dataConsulta;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}