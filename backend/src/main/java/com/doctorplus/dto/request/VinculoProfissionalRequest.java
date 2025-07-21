package com.doctorplus.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class VinculoProfissionalRequest {

    @NotNull(message = "ID do secretário é obrigatório")
    private UUID secretarioId;

    @NotNull(message = "ID do profissional é obrigatório")
    private UUID profissionalId;

    // Constructors
    public VinculoProfissionalRequest() {}

    public VinculoProfissionalRequest(UUID secretarioId, UUID profissionalId) {
        this.secretarioId = secretarioId;
        this.profissionalId = profissionalId;
    }

    // Getters and Setters
    public UUID getSecretarioId() {
        return secretarioId;
    }

    public void setSecretarioId(UUID secretarioId) {
        this.secretarioId = secretarioId;
    }

    public UUID getProfissionalId() {
        return profissionalId;
    }

    public void setProfissionalId(UUID profissionalId) {
        this.profissionalId = profissionalId;
    }
}