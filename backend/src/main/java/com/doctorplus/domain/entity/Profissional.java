package com.doctorplus.domain.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profissionais")
@EntityListeners(AuditingEntityListener.class)
public class Profissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String especialidade;

    @Column(nullable = false, unique = true)
    private String crm;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SecretarioProfissional> secretarios = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Consulta> consultas = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Historico> historicos = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Receita> receitas = new ArrayList<>();

    @OneToMany(mappedBy = "profissional", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Estoque> estoques = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Profissional() {}

    public Profissional(String especialidade, String crm, Usuario usuario) {
        this.especialidade = especialidade;
        this.crm = crm;
        this.usuario = usuario;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public String getCrm() {
        return crm;
    }

    public void setCrm(String crm) {
        this.crm = crm;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public List<SecretarioProfissional> getSecretarios() {
        return secretarios;
    }

    public void setSecretarios(List<SecretarioProfissional> secretarios) {
        this.secretarios = secretarios;
    }

    public List<Consulta> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<Consulta> consultas) {
        this.consultas = consultas;
    }

    public List<Historico> getHistoricos() {
        return historicos;
    }

    public void setHistoricos(List<Historico> historicos) {
        this.historicos = historicos;
    }

    public List<Receita> getReceitas() {
        return receitas;
    }

    public void setReceitas(List<Receita> receitas) {
        this.receitas = receitas;
    }

    public List<Estoque> getEstoques() {
        return estoques;
    }

    public void setEstoques(List<Estoque> estoques) {
        this.estoques = estoques;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}