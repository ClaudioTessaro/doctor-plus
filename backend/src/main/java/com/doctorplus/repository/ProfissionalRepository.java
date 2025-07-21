package com.doctorplus.repository;

import com.doctorplus.domain.entity.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfissionalRepository extends JpaRepository<Profissional, UUID> {

    Optional<Profissional> findByUsuarioId(UUID usuarioId);

    Optional<Profissional> findByCrm(String crm);

    boolean existsByCrm(String crm);

    @Query("SELECT p FROM Profissional p WHERE p.usuario.ativo = true")
    List<Profissional> findAllAtivos();

    List<Profissional> findByEspecialidade(String especialidade);

    @Query("SELECT p FROM Profissional p WHERE " +
           "LOWER(p.especialidade) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(p.usuario.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "p.crm LIKE CONCAT('%', :termo, '%')")
    List<Profissional> buscarPorTermo(@Param("termo") String termo);

    @Query("SELECT DISTINCT p.especialidade FROM Profissional p WHERE p.usuario.ativo = true ORDER BY p.especialidade")
    List<String> findAllEspecialidades();

    @Query("SELECT COUNT(p) FROM Profissional p WHERE p.usuario.ativo = true")
    Long countTotalProfissionais();
}