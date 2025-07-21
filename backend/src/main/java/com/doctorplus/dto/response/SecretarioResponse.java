package com.doctorplus.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class SecretarioResponse {

    private Long id;
    private UsuarioResponse usuario;
    private List<SecretarioProfissionalResponse> profissionais;
    private LocalDateTime createdAt;

    // Constructors
    public SecretarioResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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