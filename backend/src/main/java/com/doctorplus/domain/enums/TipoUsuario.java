package com.doctorplus.domain.enums;

public enum TipoUsuario {
    ADMIN("Administrador"),
    PROFISSIONAL("Profissional de Saúde"),
    SECRETARIO("Secretário");

    private final String descricao;

    TipoUsuario(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}