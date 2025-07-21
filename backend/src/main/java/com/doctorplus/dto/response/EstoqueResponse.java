package com.doctorplus.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EstoqueResponse {

    private Long id;
    private String nome;
    private String descricao;
    private String codigo;
    private Integer quantidade;
    private String unidade;
    private BigDecimal valorUnitario;
    private Integer minAlerta;
    private String categoria;
    private Boolean ativo;
    private Boolean estoqueBaixo;
    private Boolean esgotado;
    private ProfissionalResponse profissional;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public EstoqueResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

    public void setValorUnitario(BigDecimal valorUnitario) {
        this.valorUnitario = valorUnitario;
    }

    public Integer getMinAlerta() {
        return minAlerta;
    }

    public void setMinAlerta(Integer minAlerta) {
        this.minAlerta = minAlerta;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Boolean getEstoqueBaixo() {
        return estoqueBaixo;
    }

    public void setEstoqueBaixo(Boolean estoqueBaixo) {
        this.estoqueBaixo = estoqueBaixo;
    }

    public Boolean getEsgotado() {
        return esgotado;
    }

    public void setEsgotado(Boolean esgotado) {
        this.esgotado = esgotado;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}