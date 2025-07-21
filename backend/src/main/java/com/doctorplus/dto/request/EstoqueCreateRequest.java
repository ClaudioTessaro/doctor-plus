package com.doctorplus.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class EstoqueCreateRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nome;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String descricao;

    @NotBlank(message = "Código é obrigatório")
    @Size(min = 2, max = 50, message = "Código deve ter entre 2 e 50 caracteres")
    private String codigo;

    @NotNull(message = "Quantidade é obrigatória")
    @PositiveOrZero(message = "Quantidade deve ser zero ou positiva")
    private Integer quantidade;

    @NotBlank(message = "Unidade é obrigatória")
    @Size(max = 10, message = "Unidade deve ter no máximo 10 caracteres")
    private String unidade;

    @Positive(message = "Valor unitário deve ser positivo")
    private BigDecimal valorUnitario;

    @NotNull(message = "Alerta mínimo é obrigatório")
    @PositiveOrZero(message = "Alerta mínimo deve ser zero ou positivo")
    private Integer minAlerta;

    @Size(max = 50, message = "Categoria deve ter no máximo 50 caracteres")
    private String categoria;

    // Constructors
    public EstoqueCreateRequest() {}

    // Getters and Setters
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
}