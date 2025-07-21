package com.doctorplus.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class SecretarioProfissionalResponse {

    private UUID id;
    private ProfissionalResponse profissional;
    private LocalDateTime createdAt;

    // Constructors
    public SecretarioProfissionalResponse() {}

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProfissionalResponse getProfissional() {
        return profissional;
    }

    public void setProfissional(ProfissionalResponse profissional) {
        this.profissional = profissional;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}