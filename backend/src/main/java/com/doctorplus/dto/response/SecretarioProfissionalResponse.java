package com.doctorplus.dto.response;

import java.time.LocalDateTime;

public class SecretarioProfissionalResponse {

    private Long id;
    private ProfissionalResponse profissional;
    private LocalDateTime createdAt;

    // Constructors
    public SecretarioProfissionalResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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