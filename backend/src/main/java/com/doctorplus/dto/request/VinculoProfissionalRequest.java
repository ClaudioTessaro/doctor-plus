package com.doctorplus.dto.request;

import jakarta.validation.constraints.NotNull;

public class VinculoProfissionalRequest {

    @NotNull(message = "ID do secretário é obrigatório")
    private Long secretarioId;

    @NotNull(message = "ID do profissional é obrigatório")
    private Long profissionalId;

    // Constructors
    public VinculoProfissionalRequest() {}

    public VinculoProfissionalRequest(Long secretarioId, Long profissionalId) {
        this.secretarioId = secretarioId;
        this.profissionalId = profissionalId;
    }

    // Getters and Setters
    public Long getSecretarioId() {
        return secretarioId;
    }

    public void setSecretarioId(Long secretarioId) {
        this.secretarioId = secretarioId;
    }

    public Long getProfissionalId() {
        return profissionalId;
    }

    public void setProfissionalId(Long profissionalId) {
        this.profissionalId = profissionalId;
    }
}