package com.doctorplus.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class SecretarioResponse {

    private UUID id;
    private UsuarioResponse usuario;
    private List<SecretarioProfissionalResponse> profissionais;
    private LocalDateTime createdAt;

    // Constructors
    public SecretarioResponse() {}

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UsuarioResponse getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioResponse usuario) {
        this.usuario = usuario;
    }

    public List<SecretarioProfissionalResponse> getProfissionais() {
        return profissionais;
    }

    public void setProfissionais(List<SecretarioProfissionalResponse> profissionais) {
        this.profissionais = profissionais;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}