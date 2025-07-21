package com.doctorplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public class HistoricoCreateRequest {

    @NotNull(message = "ID do paciente é obrigatório")
    private UUID pacienteId;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 10, max = 2000, message = "Descrição deve ter entre 10 e 2000 caracteres")
    private String descricao;

    @Size(max = 1000, message = "Diagnóstico deve ter no máximo 1000 caracteres")
    private String diagnostico;

    @Size(max = 2000, message = "Prescrição deve ter no máximo 2000 caracteres")
    private String prescricao;

    @NotNull(message = "Data da consulta é obrigatória")
    private LocalDateTime dataConsulta;

    // Constructors
    public HistoricoCreateRequest() {}

    // Getters and Setters
    public UUID getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(UUID pacienteId) {
        this.pacienteId = pacienteId;
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
}